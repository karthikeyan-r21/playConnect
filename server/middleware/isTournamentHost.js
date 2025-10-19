const Tournament = require('../models/Tournament');

const isTournamentHost = async (req, res, next) => {
  try {
    const tournamentId = req.params.id || req.params.tournamentId;
    
    if (!tournamentId) {
      return res.status(400).json({ message: 'Tournament ID is required' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const userId = req.user && (req.user.id || req.user._id);
    const tournamentHost = tournament.host || tournament.createdBy;

    if (!userId || String(tournamentHost) !== String(userId)) {
      return res.status(403).json({ message: 'Only tournament host can perform this action' });
    }

    // Add tournament to request for easy access
    req.tournament = tournament;
    next();
  } catch (error) {
    console.error('Tournament host check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = isTournamentHost;
