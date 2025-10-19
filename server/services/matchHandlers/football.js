// Football match handler - computes deltas for standings based on football rules
// Exports applyResult({ match, score, session, tournament }) and rollbackResult({ match, previousScore, session, tournament })
const Standing = require('../../models/Standing');

async function applyResult({ match, score, session, tournament }) {
  // score: { teamA: number, teamB: number }
  const pts = { win: tournament?.pointsPerWin || 3, draw: tournament?.pointsPerDraw || 1 };
  const teamA = match.teamA; const teamB = match.teamB;
  if (!teamA || !teamB) throw new Error('Match teams not set');

  const resultA = score.teamA > score.teamB ? 'win' : (score.teamA < score.teamB ? 'loss' : 'draw');
  const resultB = resultA === 'win' ? 'loss' : (resultA === 'loss' ? 'win' : 'draw');

  const incFor = (sFor, sAgainst, res) => {
    const inc = { $inc: {}, $set: { updatedAt: new Date() } };
    inc.$inc.played = 1;
    inc.$inc.goalsFor = sFor;
    inc.$inc.goalsAgainst = sAgainst;
    inc.$inc.goalDiff = sFor - sAgainst;
    inc.$inc.won = res === 'win' ? 1 : 0;
    inc.$inc.draw = res === 'draw' ? 1 : 0;
    inc.$inc.lost = res === 'loss' ? 1 : 0;
    inc.$inc.points = res === 'win' ? pts.win : (res === 'draw' ? pts.draw : 0);
    return inc;
  };

  const incA = incFor(score.teamA, score.teamB, resultA);
  const incB = incFor(score.teamB, score.teamA, resultB);

  await Standing.findOneAndUpdate({ tournament: match.tournament, team: teamA }, incA, { new: true, upsert: true, setDefaultsOnInsert: true, session });
  await Standing.findOneAndUpdate({ tournament: match.tournament, team: teamB }, incB, { new: true, upsert: true, setDefaultsOnInsert: true, session });

  return { applied: true };
}

async function rollbackResult({ match, previousScore, session, tournament }) {
  if (!previousScore) return { rolled: false };
  const pts = { win: tournament?.pointsPerWin || 3, draw: tournament?.pointsPerDraw || 1 };
  const teamA = match.teamA; const teamB = match.teamB;
  const computeNeg = (sFor, sAgainst) => {
    const inc = { $inc: {} };
    inc.$inc.played = -1;
    inc.$inc.goalsFor = -sFor;
    inc.$inc.goalsAgainst = -sAgainst;
    inc.$inc.goalDiff = -(sFor - sAgainst);
    if (sFor > sAgainst) { inc.$inc.won = -1; inc.$inc.points = -pts.win; }
    else if (sFor < sAgainst) { inc.$inc.lost = -1; }
    else { inc.$inc.draw = -1; inc.$inc.points = -pts.draw; }
    return inc;
  };

  const negA = computeNeg(previousScore.teamA, previousScore.teamB);
  const negB = computeNeg(previousScore.teamB, previousScore.teamA);

  await Standing.findOneAndUpdate({ tournament: match.tournament, team: teamA }, negA, { new: true, session });
  await Standing.findOneAndUpdate({ tournament: match.tournament, team: teamB }, negB, { new: true, session });

  return { rolled: true };
}

module.exports = { applyResult, rollbackResult };
