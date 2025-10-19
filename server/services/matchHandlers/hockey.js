const Standing = require('../../models/Standing');

module.exports = {
  applyResult: async ({ match, score, session, tournament }) => {
    const teamA = match.teamA; const teamB = match.teamB;
    if (!teamA || !teamB) throw new Error('Match teams not set');
    const sA = Number(score.teamA || 0); const sB = Number(score.teamB || 0);
    const pts = { win: tournament?.pointsPerWin || 3, draw: tournament?.pointsPerDraw || 1 };

    const incA = { $inc: {} }; const incB = { $inc: {} };
    incA.$inc.played = 1; incB.$inc.played = 1;
    incA.$inc.goalsFor = sA; incA.$inc.goalsAgainst = sB; incA.$inc.goalDiff = sA - sB;
    incB.$inc.goalsFor = sB; incB.$inc.goalsAgainst = sA; incB.$inc.goalDiff = sB - sA;
    if (sA > sB) { incA.$inc.won = 1; incA.$inc.points = pts.win; incB.$inc.lost = 1; }
    else if (sA < sB) { incB.$inc.won = 1; incB.$inc.points = pts.win; incA.$inc.lost = 1; }
    else { incA.$inc.draw = 1; incA.$inc.points = pts.draw; incB.$inc.draw = 1; incB.$inc.points = pts.draw; }

    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamA }, incA, { upsert:true, new:true, setDefaultsOnInsert:true, session });
    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamB }, incB, { upsert:true, new:true, setDefaultsOnInsert:true, session });
    return { applied: true };
  },
  rollbackResult: async ({ match, previousScore, session, tournament }) => {
    if (!previousScore) return { rolled: false };
    const teamA = match.teamA; const teamB = match.teamB;
    const sA = Number(previousScore.teamA || 0); const sB = Number(previousScore.teamB || 0);
    const pts = { win: tournament?.pointsPerWin || 3, draw: tournament?.pointsPerDraw || 1 };
    const negA = { $inc: {} }; const negB = { $inc: {} };
    negA.$inc.played = -1; negB.$inc.played = -1;
    negA.$inc.goalsFor = -sA; negA.$inc.goalsAgainst = -sB; negA.$inc.goalDiff = -(sA - sB);
    negB.$inc.goalsFor = -sB; negB.$inc.goalsAgainst = -sA; negB.$inc.goalDiff = -(sB - sA);
    if (sA > sB) { negA.$inc.won = -1; negA.$inc.points = -(pts.win); negB.$inc.lost = -1; }
    else if (sA < sB) { negB.$inc.won = -1; negB.$inc.points = -(pts.win); negA.$inc.lost = -1; }
    else { negA.$inc.draw = -1; negA.$inc.points = -pts.draw; negB.$inc.draw = -1; negB.$inc.points = -pts.draw; }

    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamA }, negA, { session });
    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamB }, negB, { session });
    return { rolled: true };
  }
};
