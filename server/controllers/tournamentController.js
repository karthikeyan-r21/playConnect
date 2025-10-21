const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const TournamentEntry = require('../models/TournamentEntry');

// Create a new tournament
exports.createTournament = async (req, res) => {
  try {
    const {
      name,
      description,
      gameType,
      participationType,
      startDate,
      endDate,
      registrationDeadline,
      minTeams,
      maxTeams,
      ageLimit,
      entryCriteria,
      entryPolicy,
      logistics
    } = req.body;

    const tournament = new Tournament({
      name,
      description,
      gameType,
      participationType: participationType || 'mixed',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      minTeams,
      maxTeams,
      ageLimit: ageLimit || 0,
      entryCriteria: entryCriteria || {},
      entryPolicy: entryPolicy || { autoApprove: true },
      logistics: logistics || {},
      host: req.user.id,
      createdBy: req.user.id,
      status: 'upcoming'
    });

    await tournament.save();

    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('host', 'name email location');

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament: populatedTournament
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({
      message: 'Error creating tournament',
      error: error.message
    });
  }
};

// Get all tournaments
exports.listTournaments = async (req, res) => {
  try {
    const {
      gameType,
      status,
      location,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};
    
    if (gameType) filter.gameType = gameType;
    if (status) filter.status = status;
    if (location) {
      filter.$or = [
        { 'logistics.venue': new RegExp(location, 'i') },
        { 'logistics.location': new RegExp(location, 'i') }
      ];
    }

    const tournaments = await Tournament.find(filter)
      .populate('host', 'name location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTournaments: total
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({
      message: 'Error fetching tournaments',
      error: error.message
    });
  }
};

// Get single tournament
exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('host', 'name email location');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Try to get entries, but don't fail if there's an issue
    let entries = [];
    let entryStats = { total: 0, pending: 0, accepted: 0, rejected: 0 };
    
    try {
      entries = await TournamentEntry.find({ tournament: req.params.id })
        .populate('team', 'name sportType location')
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 });

      entryStats = {
        total: entries.length,
        pending: entries.filter(e => e.status === 'pending').length,
        accepted: entries.filter(e => e.status === 'accepted').length,
        rejected: entries.filter(e => e.status === 'rejected').length
      };
    } catch (entryError) {
      console.warn('Could not fetch tournament entries:', entryError.message);
    }

    res.json({
      tournament,
      entryStats,
      entries
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      message: 'Error fetching tournament',
      error: error.message
    });
  }
};

// Update tournament
exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the host
    if (tournament.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only tournament host can update tournament' });
    }

    Object.keys(req.body).forEach(key => {
      tournament[key] = req.body[key];
    });

    await tournament.save();

    const updatedTournament = await Tournament.findById(tournament._id)
      .populate('host', 'name email location');

    res.json({
      message: 'Tournament updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({
      message: 'Error updating tournament',
      error: error.message
    });
  }
};

// Delete tournament
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the host
    if (tournament.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only tournament host can delete tournament' });
    }

    await Tournament.findByIdAndDelete(req.params.id);
    await TournamentEntry.deleteMany({ tournament: req.params.id });

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({
      message: 'Error deleting tournament',
      error: error.message
    });
  }
};

// Get tournaments hosted by user
exports.getMyTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ host: req.user.id })
      .populate('host', 'name location')
      .sort({ createdAt: -1 });

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching my tournaments:', error);
    res.status(500).json({
      message: 'Error fetching tournaments',
      error: error.message
    });
  }
};

// Get tournament matches
exports.getTournamentMatches = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const Match = require('../models/Match');
    
    const matches = await Match.find({ tournament: tournamentId })
      .populate('team1', 'name sportType location')
      .populate('team2', 'name sportType location')
      .sort({ scheduledDate: 1 });

    // Group matches by status for better frontend handling
    const matchesByStatus = {
      upcoming: matches.filter(m => m.status === 'scheduled'),
      live: matches.filter(m => m.status === 'in-progress'),
      completed: matches.filter(m => m.status === 'completed'),
      all: matches
    };

    res.json({
      matches: matchesByStatus,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    res.status(500).json({
      message: 'Error fetching matches',
      error: error.message
    });
  }
};

// Generate fixtures for tournament
exports.generateFixtures = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const { fixtureType = 'round-robin' } = req.body;
    
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is tournament host
    if (tournament.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only tournament host can generate fixtures' });
    }

    // Get accepted teams
    const entries = await TournamentEntry.find({ 
      tournament: tournamentId, 
      status: 'accepted' 
    }).populate('team');

    if (entries.length < tournament.minTeams) {
      return res.status(400).json({ 
        message: `Not enough teams. Need at least ${tournament.minTeams} teams, but only have ${entries.length}` 
      });
    }

    const teamIds = entries.map(entry => entry.team._id);
    
    // Generate fixtures based on type
    const FixtureService = require('../services/fixtureService');
    let matches;
    
    if (fixtureType === 'single-elimination') {
      matches = await FixtureService.generateSingleElimination(tournamentId, teamIds, {
        scheduleStart: tournament.startDate,
        intervalMinutes: 90
      });
    } else {
      matches = await FixtureService.generateRoundRobin(tournamentId, teamIds, {
        scheduleStart: tournament.startDate,
        intervalMinutes: 60
      });
    }

    // Update tournament status
    tournament.status = 'scheduled';
    await tournament.save();

    res.status(201).json({
      message: `Generated ${matches.length} fixtures successfully`,
      matches: matches.length,
      fixtureType,
      tournament: tournament
    });

  } catch (error) {
    console.error('Error generating fixtures:', error);
    res.status(500).json({
      message: 'Error generating fixtures',
      error: error.message
    });
  }
};