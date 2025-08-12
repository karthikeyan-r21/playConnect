// middleware/ownership.js
const Match = require('../models/Match');

async function ensureMatchOwner(req, res, next) {
  try {
    const matchId = req.params.id;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this match' });
    }

    // attach match to request for controller convenience
    req.match = match;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = ensureMatchOwner;
