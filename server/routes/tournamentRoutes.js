const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tournamentController = require('../controllers/tournamentController');
const entryController = require('../controllers/entryController');
const matchController = require('../controllers/matchController');
const isTournamentHost = require('../middleware/isTournamentHost');

router.post('/', auth, tournamentController.createTournament);
router.get('/', tournamentController.listTournaments);
router.get('/:id', tournamentController.getTournament);

// entries
router.post('/:id/join', auth, entryController.requestJoin);
router.get('/:id/entries', auth, isTournamentHost, async (req,res)=>{
  // simple list entries (host only)
  const TournamentEntry = require('../models/TournamentEntry');
  const entries = await TournamentEntry.find({ tournament: req.params.id }).populate('team requestedBy');
  res.json({ entries });
});
router.put('/:id/entries/:entryId/approve', auth, isTournamentHost, entryController.approveEntry);
router.put('/:id/entries/:entryId/reject', auth, isTournamentHost, entryController.rejectEntry);

// matches - temporarily disabled until match result functions are implemented
// router.post('/:tournamentId/matches/:matchId/result', auth, isTournamentHost, matchController.recordResult);
// router.put('/:tournamentId/matches/:matchId/result', auth, isTournamentHost, matchController.updateResult);

// host can create a tournament match (fixture)
router.post('/:id/matches', auth, isTournamentHost, async (req, res) => {
  try {
    const TournamentMatch = require('../models/TournamentMatch');
    const { teamA, teamB, scheduledAt, venue, venueGeo, round } = req.body;
    const match = await TournamentMatch.create({ tournament: req.params.id, teamA, teamB, scheduledAt, venue, venueGeo, round });
    res.status(201).json({ match });
  } catch (err) {
    console.error('Create tournament match error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// list matches for a tournament
router.get('/:id/matches', auth, async (req, res) => {
  try {
    const TournamentMatch = require('../models/TournamentMatch');
    const matches = await TournamentMatch.find({ tournament: req.params.id }).sort({ scheduledAt: 1 });
    res.json({ matches });
  } catch (err) {
    console.error('List tournament matches error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Host can generate fixtures automatically (supports algorithm + options)
router.post('/:id/generate-fixtures', auth, isTournamentHost, async (req, res) => {
  try {
    const fixtureService = require('../services/fixtureService');
    const Tournament = require('../models/Tournament');
    const TournamentEntry = require('../models/TournamentEntry');
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // safe body handling
    const body = req.body || {};
    const algorithm = body.algorithm || 'round-robin';
    const options = body.options || {};

    // fetch accepted teams
    const entries = await TournamentEntry.find({ tournament: req.params.id, status: 'accepted' }).select('team');
    const teamIds = entries.map(e => e.team);

    // prefer a dispatcher if fixtureService exposes it, otherwise fall back
    let created = [];
    if (typeof fixtureService.generateFixtures === 'function') {
      created = await fixtureService.generateFixtures(req.params.id, teamIds, { algorithm, options });
    } else if (algorithm === 'round-robin' && typeof fixtureService.generateRoundRobin === 'function') {
      created = await fixtureService.generateRoundRobin(req.params.id, teamIds, options);
    } else if (algorithm === 'knockout' && typeof fixtureService.generateKnockout === 'function') {
      created = await fixtureService.generateKnockout(req.params.id, teamIds, options);
    } else {
      return res.status(400).json({ message: 'Unsupported fixture generation algorithm' });
    }

    // mark tournament scheduled/running depending on startDate
    tournament.status = tournament.startDate && new Date(tournament.startDate) <= new Date() ? 'running' : 'scheduled';
    await tournament.save();

    res.json({ createdCount: Array.isArray(created) ? created.length : 0, matches: created });
  } catch (err) {
    console.error('generate fixtures error', err);
    // give helpful feedback for missing body/options
    if (err && err.message && err.message.includes("Cannot read properties of undefined")) {
      return res.status(400).json({ message: 'Invalid request body; expected { algorithm?, options? }' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Host can update match schedule manually and notify teams
router.patch('/:tournamentId/matches/:matchId/schedule', auth, isTournamentHost, async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    const body = req.body || {};

    // Prevent accidental modification of core match participants via this endpoint
    if (Object.prototype.hasOwnProperty.call(body, 'teamA') || Object.prototype.hasOwnProperty.call(body, 'teamB')) {
      return res.status(400).json({ message: 'teamA/teamB cannot be modified via schedule endpoint' });
    }

    const allowed = {};
    if (body.scheduledAt) {
      const dt = new Date(body.scheduledAt);
      if (isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid scheduledAt' });
      allowed.scheduledAt = dt;
    }
    if (body.venue !== undefined) allowed.venue = String(body.venue);
    if (body.venueGeo && typeof body.venueGeo === 'object' && Array.isArray(body.venueGeo.coordinates)) {
      allowed.venueGeo = { type: 'Point', coordinates: body.venueGeo.coordinates.map(Number) };
    }
    // Allow explicit homeTeam toggle but validate
    if (Object.prototype.hasOwnProperty.call(body, 'homeTeam')) {
      const v = body.homeTeam;
      if (v !== 'A' && v !== 'B' && v !== null) return res.status(400).json({ message: 'homeTeam must be "A", "B", or null' });
      allowed.homeTeam = v;
    }

    if (Object.keys(allowed).length === 0) return res.status(400).json({ message: 'No valid fields to update' });

    const TournamentMatch = require('../models/TournamentMatch');
    const match = await TournamentMatch.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.tournament) !== String(tournamentId)) return res.status(400).json({ message: 'Match does not belong to tournament' });

    // Apply allowed updates only
    for (const [k, v] of Object.entries(allowed)) {
      match[k] = v;
    }
    await match.save();

    try {
      // notify all accepted team owners (keep original behavior) and team owners of this match
      const TournamentEntry = require('../models/TournamentEntry');
      const entries = await TournamentEntry.find({ tournament: tournamentId, status: 'accepted' }).populate('team');
      const { createNotification } = require('../controllers/notificationController');

      // notify everyone in accepted entries
      await Promise.all(entries.map(async e => {
        const owner = (e.team && e.team.createdBy) ? e.team.createdBy : null;
        if (owner) await createNotification(owner, `Match ${matchId} for tournament ${tournamentId} has been rescheduled to ${match.scheduledAt}`, 'match_rescheduled');
      }));
    } catch (e) { console.warn('notify owners failed', e && e.message ? e.message : e); }

    res.json({ message: 'Match schedule updated', match });
  } catch (err) {
    console.error('schedule update error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// standings (simple)
router.get('/:id/standings', auth, async (req,res) => {
  const Standing = require('../models/Standing');
  const standings = await Standing.find({ tournament: req.params.id }).sort({ points: -1, goalDiff: -1, goalsFor: -1 });
  res.json({ standings });
});

// richer leaderboard for frontend (team info + stats)
router.get('/:id/leaderboard', auth, async (req,res) => {
  try {
    const Standing = require('../models/Standing');
    const Team = require('../models/Team');
    const boards = await Standing.find({ tournament: req.params.id })
      .sort({ points: -1, goalDiff: -1, goalsFor: -1 })
      .lean();

    // populate minimal team info
    const teamIds = boards.map(b => b.team);
    const teams = await Team.find({ _id: { $in: teamIds } }).select('name createdBy').lean();
    const teamMap = new Map(teams.map(t => [String(t._id), t]));

    const result = boards.map(b => ({
      teamId: b.team,
      teamName: teamMap.get(String(b.team))?.name || 'Unknown',
      played: b.played || 0,
      won: b.won || 0,
      draw: b.draw || 0,
      lost: b.lost || 0,
      goalsFor: b.goalsFor || 0,
      goalsAgainst: b.goalsAgainst || 0,
      goalDiff: b.goalDiff || 0,
      points: b.points || 0,
      lastMatches: b.lastMatches || []
    }));

    res.json({ leaderboard: result });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
