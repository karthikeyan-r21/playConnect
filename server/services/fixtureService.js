// Lightweight fixture generator: round-robin and full knockout bracket implementations
const TournamentMatch = require('../models/TournamentMatch');
const mongoose = require('mongoose');

// helper: shuffle array in-place
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generate round-robin fixtures (single round) for an array of team ids
 * options: { scheduleStart: Date|string, intervalMinutes: number }
 */
async function generateRoundRobin(tournamentId, teamIds, options = {}) {
  if (!Array.isArray(teamIds) || teamIds.length < 2) return [];
  const teams = [...teamIds];
  // If odd, add a bye (null)
  const hasBye = teams.length % 2 === 1;
  if (hasBye) teams.push(null);
  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;
  const matches = [];
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const t1 = teams[i];
      const t2 = teams[n - 1 - i];
      if (t1 && t2) {
        matches.push({ tournament: tournamentId, teamA: t1, teamB: t2, round: round + 1 });
      }
    }
    // rotate teams except first
    const last = teams.pop();
    teams.splice(1, 0, last);
  }

  // Optionally schedule times
  if (options.scheduleStart) {
    const start = new Date(options.scheduleStart);
    const interval = Number(options.intervalMinutes) || 60;
    for (let i = 0; i < matches.length; i++) {
      matches[i].scheduledAt = new Date(start.getTime() + i * interval * 60000);
    }
  }

  // Persist matches
  const created = await TournamentMatch.insertMany(matches);
  return created;
}

/**
 * Generate single-elimination knockout bracket fixtures.
 * Simple approach: randomly shuffle teams and pair them for round 1. Does not create subsequent rounds.
 * options: { scheduleStart, intervalMinutes }
 */
async function generateKnockout(tournamentId, teamIds, options = {}) {
  if (!Array.isArray(teamIds) || teamIds.length < 2) return [];

  // options: { scheduleStart, intervalMinutes, seedOrder: [teamId...], homeAway: bool, avoidPairs: [[a,b], ...], timezone }
  const opts = Object.assign({}, options || {});
  let teams = Array.from(teamIds);

  // seeding: if seedOrder provided, place those teams first (preserve order)
  if (Array.isArray(opts.seedOrder) && opts.seedOrder.length > 0) {
    const seedSet = new Set(opts.seedOrder.map(String));
    const seeded = [];
    const rest = [];
    for (const t of teams) {
      if (seedSet.has(String(t))) seeded.push(t);
      else rest.push(t);
    }
    teams = [...seeded, ...rest];
  } else {
    shuffle(teams);
  }

  // compute nearest power of two and pad with nulls (byes)
  const initialCount = teams.length;
  const rounds = Math.ceil(Math.log2(Math.max(2, initialCount)));
  const bracketSize = Math.pow(2, rounds);
  while (teams.length < bracketSize) teams.push(null);

  // simple avoidance rule: if provided, attempt to shuffle to avoid forbidden first-round pairs
  if (Array.isArray(opts.avoidPairs) && opts.avoidPairs.length > 0) {
    const avoid = new Set(opts.avoidPairs.map(p => `${String(p[0])}|${String(p[1])}`));
    let attempts = 0;
    while (attempts < 20) {
      let broken = false;
      for (let i = 0; i < teams.length; i += 2) {
        const a = teams[i]; const b = teams[i+1];
        if (!a || !b) continue;
        if (avoid.has(`${String(a)}|${String(b)}`) || avoid.has(`${String(b)}|${String(a)}`)) { broken = true; break; }
      }
      if (!broken) break;
      shuffle(teams);
      attempts++;
    }
  }

  // We'll create placeholder ObjectIds for all matches so we can wire parent/next refs
  const matchDocs = [];
  const roundMatches = []; // array of arrays per round

  // create round 1 matches from teams
  const round1 = [];
  for (let i = 0; i < teams.length; i += 2) {
    const t1 = teams[i];
    const t2 = teams[i+1] || null;
    const id = new mongoose.Types.ObjectId();
    const doc = { _id: id, tournament: tournamentId, teamA: t1, teamB: t2, round: 1, status: t1 && t2 ? 'scheduled' : 'scheduled' };
    if (opts.homeAway) doc.homeTeam = (Math.random() > 0.5 ? 'A' : 'B');
    round1.push(doc);
    matchDocs.push(doc);
  }
  roundMatches.push(round1);

  // generate placeholder matches for subsequent rounds
  let prevRound = round1;
  for (let r = 2; r <= rounds; r++) {
    const matchesThisRound = [];
    for (let i = 0; i < prevRound.length; i += 2) {
      const parentA = prevRound[i];
      const parentB = prevRound[i+1];
      const id = new mongoose.Types.ObjectId();
      const doc = { _id: id, tournament: tournamentId, teamA: null, teamB: null, round: r, parentMatchA: parentA ? parentA._id : null, parentMatchB: parentB ? parentB._id : null, status: 'scheduled' };
      matchesThisRound.push(doc);
      matchDocs.push(doc);
    }
    roundMatches.push(matchesThisRound);
    prevRound = matchesThisRound;
  }

  // wire nextMatch references for parent matches
  const idMap = new Map(matchDocs.map(m => [String(m._id), m]));
  for (let r = 1; r < roundMatches.length; r++) {
    const prev = roundMatches[r-1];
    const cur = roundMatches[r];
    for (let i = 0; i < cur.length; i++) {
      const pA = prev[i*2];
      const pB = prev[i*2 + 1];
      if (pA) pA.nextMatch = cur[i]._id;
      if (pB) pB.nextMatch = cur[i]._id;
    }
  }

  // schedule times if requested: order by round asc then index
  if (opts.scheduleStart) {
    const start = new Date(opts.scheduleStart);
    const interval = Number(opts.intervalMinutes) || 60;
    let counter = 0;
    for (let r = 0; r < roundMatches.length; r++) {
      for (let i = 0; i < roundMatches[r].length; i++) {
        roundMatches[r][i].scheduledAt = new Date(start.getTime() + counter * interval * 60000);
        counter++;
      }
    }
  }

  // persist all matches (we used pre-created _id values)
  const created = await TournamentMatch.insertMany(matchDocs);

  return created;
}

async function generateFixtures(tournamentId, teamIds, opts = {}) {
  const algo = (opts.algorithm || opts.type || 'round-robin').toLowerCase();
  if (algo === 'knockout' || algo === 'single-elimination') return generateKnockout(tournamentId, teamIds, opts.options || opts);
  return generateRoundRobin(tournamentId, teamIds, opts.options || opts);
}

module.exports = { generateRoundRobin, generateKnockout, generateFixtures };
