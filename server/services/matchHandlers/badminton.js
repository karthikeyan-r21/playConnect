const Standing = require('../../models/Standing');

module.exports = {
  applyResult: async ({ match, score, session, tournament }) => {
    // score: { teamAPoints, teamBPoints }
    const teamA = match.teamA; const teamB = match.teamB;
    if (!teamA || !teamB) throw new Error('Match teams not set');
    const a = Number(score.teamAPoints || score.teamA || 0);
    const b = Number(score.teamBPoints || score.teamB || 0);
    const pts = { win: tournament?.pointsPerWin || 3, draw: tournament?.pointsPerDraw || 1 };
    const deltaA = { played:1, points: 0 }; const deltaB = { played:1, points: 0 };
    if (a > b) { deltaA.won = 1; deltaB.lost = 1; deltaA.points = pts.win; }
    else if (b > a) { deltaB.won = 1; deltaA.lost = 1; deltaB.points = pts.win; }
    else { deltaA.draw = 1; deltaB.draw = 1; deltaA.points = pts.draw; deltaB.points = pts.draw; }
    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamA }, { $inc: deltaA }, { upsert:true, new:true, session });
    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamB }, { $inc: deltaB }, { upsert:true, new:true, session });
    return { applied: true };
  },
  rollbackResult: async ({ match, previousScore, session, tournament }) => {
    if (!previousScore) return { rolled: false };
    const teamA = match.teamA; const teamB = match.teamB;
    const a = Number(previousScore.teamAPoints || previousScore.teamA || 0);
    const b = Number(previousScore.teamBPoints || previousScore.teamB || 0);
    const pts = { win: tournament?.pointsPerWin || 3, draw: tournament?.pointsPerDraw || 1 };
    const deltaA = { played:-1, points: 0 }; const deltaB = { played:-1, points: 0 };
    if (a > b) { deltaA.won = -1; deltaB.lost = -1; deltaA.points = -pts.win; }
    else if (b > a) { deltaB.won = -1; deltaA.lost = -1; deltaB.points = -pts.win; }
    else { deltaA.draw = -1; deltaB.draw = -1; deltaA.points = -pts.draw; deltaB.points = -pts.draw; }
    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamA }, { $inc: deltaA }, { session });
    await Standing.findOneAndUpdate({ tournament: tournament._id, team: teamB }, { $inc: deltaB }, { session });
    return { rolled: true };
  }
};
