const Tournament = require('../models/Tournament');

// validation helper
function validateTournamentPayload(body) {
  const errors = [];
  const cleaned = {};

  const allowedGameTypes = ['football','cricket','hockey','kabaddi','volleyball','badminton','tennis','other'];

  if (!body.name || String(body.name).trim().length < 3) errors.push('name is required (min 3 chars)');
  else cleaned.name = String(body.name).trim();

  if (body.gameType) {
    const gt = String(body.gameType).toLowerCase();
    if (!allowedGameTypes.includes(gt)) errors.push(`gameType must be one of: ${allowedGameTypes.join(', ')}`);
    else cleaned.gameType = gt;
  }

  const minTeams = (body.minTeams == null) ? null : Number(body.minTeams);
  const maxTeams = (body.maxTeams == null) ? null : Number(body.maxTeams);
  if (minTeams != null && (!Number.isInteger(minTeams) || minTeams < 1)) errors.push('minTeams must be integer >= 1');
  if (maxTeams != null && (!Number.isInteger(maxTeams) || maxTeams < 1)) errors.push('maxTeams must be integer >= 1');
  if (minTeams != null && maxTeams != null && minTeams > maxTeams) errors.push('minTeams cannot be greater than maxTeams');
  if (minTeams != null) cleaned.minTeams = minTeams;
  if (maxTeams != null) cleaned.maxTeams = maxTeams;

  // dates
  const parseDate = (v) => { const d = v ? new Date(v) : null; return (d && !isNaN(d.getTime())) ? d : null; };
  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);
  const regDeadline = parseDate(body.registrationDeadline);

  if (regDeadline && startDate && regDeadline > startDate) errors.push('registrationDeadline must be on or before startDate');
  if (startDate && endDate && startDate > endDate) errors.push('startDate must be on or before endDate');
  if (startDate) cleaned.startDate = startDate;
  if (endDate) cleaned.endDate = endDate;
  if (regDeadline) cleaned.registrationDeadline = regDeadline;

  // numeric configs
  if (body.pointsPerWin != null) {
    const v = Number(body.pointsPerWin);
    if (!Number.isFinite(v) || v < 0) errors.push('pointsPerWin must be >= 0');
    else cleaned.pointsPerWin = v;
  }
  if (body.pointsPerDraw != null) {
    const v = Number(body.pointsPerDraw);
    if (!Number.isFinite(v) || v < 0) errors.push('pointsPerDraw must be >= 0');
    else cleaned.pointsPerDraw = v;
  }
  if (cleaned.pointsPerWin != null && cleaned.pointsPerDraw != null && cleaned.pointsPerWin < cleaned.pointsPerDraw) {
    errors.push('pointsPerWin should be >= pointsPerDraw');
  }

  // booleans and entryPolicy
  if (body.autoGenerateOnMinReached != null) cleaned.autoGenerateOnMinReached = !!body.autoGenerateOnMinReached;
  if (body.entryPolicy) {
    const ep = body.entryPolicy;
    cleaned.entryPolicy = {};
    if (ep.autoApprove != null) cleaned.entryPolicy.autoApprove = !!ep.autoApprove;
    if (ep.hostApprovalRequired != null) cleaned.entryPolicy.hostApprovalRequired = !!ep.hostApprovalRequired;
  }

  // logistics.venueGeo coordinates validation if provided
  if (body.logistics && body.logistics.venueGeo) {
    if (!Array.isArray(body.logistics.venueGeo.coordinates) || body.logistics.venueGeo.coordinates.length !== 2) {
      errors.push('logistics.venueGeo.coordinates is required and must be [lng, lat]');
    } else {
      cleaned.logistics = cleaned.logistics || {};
      cleaned.logistics.venueGeo = { type: 'Point', coordinates: body.logistics.venueGeo.coordinates.map(Number) };
    }
  }

  return { ok: errors.length === 0, errors, cleaned };
}

exports.createTournament = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const host = req.user._id || req.user.id;
    if (!host) return res.status(401).json({ message: 'Unauthorized' });
    const payload = req.body || {};

    const { ok, errors, cleaned } = validateTournamentPayload(payload);
    if (!ok) return res.status(400).json({ message: 'Validation failed', errors });

    const createData = Object.assign({}, payload, cleaned);
    createData.host = host;
    // ensure meta exists
    createData.meta = createData.meta || { teamsCount: 0 };

    const tournament = await Tournament.create(createData);
    res.status(201).json({ tournament });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const host = req.user._id || req.user.id;
    const payload = req.body || {};
    const { ok, errors, cleaned } = validateTournamentPayload(payload);
    if (!ok) return res.status(400).json({ message: 'Validation failed', errors });

    const tournamentId = req.params.id;
    const t = await Tournament.findById(tournamentId);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    if (String(t.host) !== String(host)) return res.status(403).json({ message: 'Only host can update tournament' });

    const updates = Object.assign({}, payload, cleaned);
    const updated = await Tournament.findByIdAndUpdate(tournamentId, { $set: updates }, { new: true });
    res.json({ tournament: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id).lean();
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json({ tournament });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listTournaments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.gameType) filter.gameType = req.query.gameType;
    if (req.query.status) filter.status = req.query.status;
    const tournaments = await Tournament.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ tournaments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
