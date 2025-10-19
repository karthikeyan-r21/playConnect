const Tournament = require('../models/Tournament');
const TournamentEntry = require('../models/TournamentEntry');
const { checkTeamEligibility } = require('../services/eligibilityService');
const NotificationService = require('../services/notificationService'); // placeholder, reuse existing in project
const Team = require('../models/Team');

exports.requestJoin = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const { teamId } = req.body;
  const userId = req.user && (req.user.id || req.user._id);
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message:'Tournament not found' });

  // run eligibility checks
    const { ok, failures } = await checkTeamEligibility(tournament, teamId);

    // enforce capacity: if tournament has a maxTeams, reject new joins when full
    if (tournament.maxTeams) {
      const acceptedCount = await TournamentEntry.countDocuments({ tournament: tournamentId, status: 'accepted' });
      if (acceptedCount >= Number(tournament.maxTeams)) {
        return res.status(400).json({ message: 'Tournament full' });
      }
    }

    // Check for specific failures that should be immediate rejections
    if (failures && failures.length) {
      // Check for sport type mismatch - this should be an immediate error, not just rejected entry
      if (failures.includes('sport-type-mismatch')) {
        const team = await Team.findById(teamId).select('sportType name');
        return res.status(400).json({ 
          message: `Team sport mismatch: ${team?.name || 'Team'} plays ${team?.sportType || 'unknown'} but tournament is for ${tournament.gameType}`,
          code: 'SPORT_TYPE_MISMATCH',
          teamSport: team?.sportType,
          tournamentSport: tournament.gameType
        });
      }
    }

    // Decide status based on eligibility and tournament policy
    let status = 'pending';
    if (failures && failures.length) {
      status = 'rejected';
    } else {
      // no failures
      if (tournament.entryPolicy && tournament.entryPolicy.autoApprove) status = 'accepted';
      else status = 'pending';
    }

    try {
      const entry = await TournamentEntry.create({
        tournament: tournamentId,
        team: teamId,
        requestedBy: userId,
        status,
        autoChecked: true,
        eligibilityFailures: failures
      });

      // determine team owner to notify (prefer team.createdBy)
      let teamOwnerId = userId;
      try {
        const teamDoc = await Team.findById(teamId).select('createdBy name');
        if (teamDoc && teamDoc.createdBy) teamOwnerId = teamDoc.createdBy;
      } catch (e) {
        // ignore
      }

      // If rejected automatically, notify team owner about failures
      if (status === 'rejected') {
        try {
          const { createNotification } = require('./notificationController');
          await createNotification(teamOwnerId, `Your team does not meet eligibility for ${tournament.name}. Reasons: ${failures.join(', ')}`, 'tournament_join_rejected');
        } catch (e) { console.warn('notify createNotification failed', e && e.message ? e.message : e); }
        return res.status(200).json({ status: 'rejected', entryId: entry._id, failures });
      }

      // If auto-accepted, perform acceptance side-effects (standings, counts, optional fixture generation) and notify
      if (status === 'accepted') {
        try {
          // increment tournament meta count
          tournament.meta = tournament.meta || {};
          tournament.meta.teamsCount = (tournament.meta.teamsCount || 0) + 1;
          await tournament.save();

          // Ensure a Standing document exists for this team in the tournament
          try {
            const Standing = require('../models/Standing');
            await Standing.findOneAndUpdate(
              { tournament: tournamentId, team: teamId },
              { $setOnInsert: { tournament: tournamentId, team: teamId, played: 0, won:0, draw:0, lost:0, goalsFor:0, goalsAgainst:0, goalDiff:0, points:0, updatedAt: new Date() } },
              { upsert: true }
            );
          } catch (err) { console.warn('Could not create initial standing:', err && err.message ? err.message : err); }

          // Auto-generate fixtures if configured and enough teams
          try {
            if (tournament.autoGenerateOnMinReached && tournament.meta.teamsCount >= (tournament.minTeams || 2) && ['draft','open','scheduled'].includes(tournament.status)) {
              const fixtureService = require('../services/fixtureService');
              const entries = await TournamentEntry.find({ tournament: tournamentId, status: 'accepted' }).select('team');
              const teamIds = entries.map(e => e.team);
              await fixtureService.generateRoundRobin(tournamentId, teamIds, { scheduleStart: tournament.startDate || new Date(), intervalMinutes: 60 });
              tournament.status = tournament.startDate && new Date(tournament.startDate) <= new Date() ? 'running' : 'scheduled';
              await tournament.save();
            }
          } catch (e) { console.warn('Auto-generate fixtures failed:', e && e.message ? e.message : e); }

          // notify team owner of acceptance
          try {
            const { createNotification } = require('./notificationController');
            await createNotification(teamOwnerId, `Your team ${teamOwnerId ? '' : ''} has been accepted into ${tournament.name}`, 'tournament_join_accepted');
          } catch (e) { console.warn('notify createNotification failed', e && e.message ? e.message : e); }

          return res.status(201).json({ status: 'accepted', entryId: entry._id });
        } catch (e) {
          console.warn('auto-accept handling failed', e && e.message ? e.message : e);
          // fallthrough to respond pending if something odd happened
        }
      }

      // notify host of pending request
      try {
        const { createNotification } = require('./notificationController');
        await createNotification(tournament.host, `Team requested to join ${tournament.name}`, 'tournament_join_request');
      } catch (e) { console.warn('notify createNotification failed', e && e.message ? e.message : e); }

      return res.status(201).json({ status: 'pending', entryId: entry._id, failures });
    } catch (err) {
      if (err.code === 11000) return res.status(400).json({ message: 'Team already requested' });
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveEntry = async (req,res) => {
  try {
    const { id: tournamentId, entryId } = req.params;
  const userId = req.user && (req.user.id || req.user._id);
    console.log('approveEntry: req.user=', req.user, 'params=', req.params);
    const tournament = await Tournament.findById(tournamentId);
    console.log('approveEntry: tournament.host=', tournament && tournament.host);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (String(tournament.host) !== String(userId)) return res.status(403).json({ message:'Forbidden' });

    const entry = await TournamentEntry.findById(entryId).populate('team');
    if (!entry) return res.status(404).json({ message:'Entry not found' });

    const acceptedCount = await TournamentEntry.countDocuments({ tournament: tournamentId, status:'accepted' });
    if (tournament.maxTeams && acceptedCount >= Number(tournament.maxTeams)) {
      return res.status(400).json({ message:'Tournament full' });
    }

  entry.status = 'accepted';
  entry.updatedAt = new Date();
  await entry.save();

  tournament.meta.teamsCount = (tournament.meta.teamsCount || 0) + 1;
  await tournament.save();

    // Auto-generate fixtures if flag set and enough teams reached
    try {
      if (tournament.autoGenerateOnMinReached && tournament.meta.teamsCount >= (tournament.minTeams || 2) && ['draft','open','scheduled'].includes(tournament.status)) {
        const fixtureService = require('../services/fixtureService');
        const entries = await TournamentEntry.find({ tournament: tournamentId, status: 'accepted' }).select('team');
        const teamIds = entries.map(e => e.team);
        await fixtureService.generateRoundRobin(tournamentId, teamIds, { scheduleStart: tournament.startDate || new Date(), intervalMinutes: 60 });
        tournament.status = tournament.startDate && new Date(tournament.startDate) <= new Date() ? 'running' : 'scheduled';
        await tournament.save();
      }
    } catch (e) {
      console.warn('Auto-generate fixtures failed:', e && e.message ? e.message : e);
    }

    // Ensure a Standing document exists for this team in the tournament
    try {
      const Standing = require('../models/Standing');
      await Standing.findOneAndUpdate(
        { tournament: tournamentId, team: entry.team._id },
        { $setOnInsert: { tournament: tournamentId, team: entry.team._id, played: 0, won:0, draw:0, lost:0, goalsFor:0, goalsAgainst:0, goalDiff:0, points:0, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (err) {
      console.warn('Could not create initial standing:', err.message || err);
    }

    // notify team owner about approval
    try {
      const teamDoc = await Team.findById(entry.team._id).select('createdBy name');
      const notifyTo = (teamDoc && teamDoc.createdBy) ? teamDoc.createdBy : entry.requestedBy;
      try {
        const { createNotification } = require('./notificationController');
        await createNotification(notifyTo, `Your team ${entry.team.name || entry.team._id} has been accepted into ${tournament.name}`, 'entry_approved');
      } catch (e) { console.warn('notify createNotification failed', e && e.message ? e.message : e); }
    } catch (e) {
      console.warn('Could not notify team owner on approval', e && e.message ? e.message : e);
    }

    return res.json({ status:'accepted', entryId: entry._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
};

exports.rejectEntry = async (req,res) => {
  try {
    const { id: tournamentId, entryId } = req.params;
  const userId = req.user && (req.user.id || req.user._id);
    const entry = await TournamentEntry.findById(entryId).populate('tournament');
    if (!entry) return res.status(404).json({ message:'Entry not found' });
    if (String(entry.tournament.host) !== String(userId)) return res.status(403).json({ message:'Forbidden' });
    entry.status = 'rejected';
    entry.updatedAt = new Date();
    await entry.save();
    try {
      const teamDoc = await Team.findById(entry.team).select('createdBy name');
      const notifyTo = (teamDoc && teamDoc.createdBy) ? teamDoc.createdBy : entry.requestedBy;
      const { createNotification } = require('./notificationController');
      await createNotification(notifyTo, `Your request to join ${entry.tournament.name || ''} was rejected`, 'entry_rejected');
    } catch (e) {
      console.warn('Could not notify team owner on rejection', e && e.message ? e.message : e);
    }
    return res.json({ status:'rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
};
