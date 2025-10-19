const Standing = require('../../models/Standing');

module.exports = {
  applyResult: async ({ match, score, session, tournament }) => {
    const teamA = match.teamA; const teamB = match.teamB;
    if (!teamA || !teamB) throw new Error('Match teams not set');
    const ptsA = Number(score.teamAPoints || score.teamA || 0);
    const ptsB = Number(score.teamBPoints || score.teamB || 0);
    const raidA = Number(score.teamARaid || score.teamATackle || 0);
    const raidB = Number(score.teamBRaid || score.teamBTackle || 0);
    const ptsWin = tournament?.pointsPerWin || 2; const ptsTie = tournament?.pointsPerDraw || 1;
    const delta = [];
    if (ptsA === ptsB) {
      delta.push({ teamId: teamA, inc: { played:1, tied:1, points: ptsTie, raidPoints: raidA } });
      delta.push({ teamId: teamB, inc: { played:1, tied:1, points: ptsTie, raidPoints: raidB } });
    } else if (ptsA > ptsB) {
      delta.push({ teamId: teamA, inc: { played:1, won:1, points: ptsWin, raidPoints: raidA } });
      delta.push({ teamId: teamB, inc: { played:1, lost:1, raidPoints: raidB } });
    } else {
      delta.push({ teamId: teamB, inc: { played:1, won:1, points: ptsWin, raidPoints: raidB } });
      delta.push({ teamId: teamA, inc: { played:1, lost:1, raidPoints: raidA } });
    }
    for (const d of delta) await Standing.findOneAndUpdate({ tournament: tournament._id, team: d.teamId }, { $inc: d.inc }, { upsert:true, new:true, session });
    return { applied: true };
  },
  rollbackResult: async ({ match, previousScore, session, tournament }) => {
    if (!previousScore) return { rolled: false };
    const teamA = match.teamA; const teamB = match.teamB;
    const ptsA = Number(previousScore.teamAPoints || previousScore.teamA || 0);
    const ptsB = Number(previousScore.teamBPoints || previousScore.teamB || 0);
    const raidA = Number(previousScore.teamARaid || previousScore.teamATackle || 0);
    const raidB = Number(previousScore.teamBRaid || previousScore.teamBTackle || 0);
    const ptsWin = tournament?.pointsPerWin || 2; const ptsTie = tournament?.pointsPerDraw || 1;
    const delta = [];
    if (ptsA === ptsB) {
      delta.push({ teamId: teamA, inc: { played:-1, tied:-1, points: -ptsTie, raidPoints: -raidA } });
      delta.push({ teamId: teamB, inc: { played:-1, tied:-1, points: -ptsTie, raidPoints: -raidB } });
    } else if (ptsA > ptsB) {
      delta.push({ teamId: teamA, inc: { played:-1, won:-1, points:-ptsWin, raidPoints: -raidA } });
      delta.push({ teamId: teamB, inc: { played:-1, lost:-1, raidPoints: -raidB } });
    } else {
      delta.push({ teamId: teamB, inc: { played:-1, won:-1, points:-ptsWin, raidPoints: -raidB } });
      delta.push({ teamId: teamA, inc: { played:-1, lost:-1, raidPoints: -raidA } });
    }
    for (const d of delta) await Standing.findOneAndUpdate({ tournament: tournament._id, team: d.teamId }, { $inc: d.inc }, { session });
    return { rolled: true };
  }
};
