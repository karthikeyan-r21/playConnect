const Standing = require('../../models/Standing');

module.exports = {
  applyResult: async ({ match, score, session, tournament }) => {
    // score: { teamARuns, teamBRuns }
    const teamA = match.teamA; const teamB = match.teamB;
    if (!teamA || !teamB) throw new Error('Match teams not set');
    const runsA = Number(score.teamARuns || score.teamA || 0);
    const runsB = Number(score.teamBRuns || score.teamB || 0);
    const ptsWin = tournament?.pointsPerWin || 2; // cricket common 2 for win
    const ptsTie = tournament?.pointsPerDraw || 1;

    const delta = [];
    if (runsA === runsB) {
      delta.push({ teamId: teamA, inc: { played:1, tied:1, points: ptsTie, runsFor: runsA, runsAgainst: runsB } });
      delta.push({ teamId: teamB, inc: { played:1, tied:1, points: ptsTie, runsFor: runsB, runsAgainst: runsA } });
    } else if (runsA > runsB) {
      delta.push({ teamId: teamA, inc: { played:1, won:1, points: ptsWin, runsFor: runsA, runsAgainst: runsB } });
      delta.push({ teamId: teamB, inc: { played:1, lost:1, runsFor: runsB, runsAgainst: runsA } });
    } else {
      delta.push({ teamId: teamB, inc: { played:1, won:1, points: ptsWin, runsFor: runsB, runsAgainst: runsA } });
      delta.push({ teamId: teamA, inc: { played:1, lost:1, runsFor: runsA, runsAgainst: runsB } });
    }

    for (const d of delta) {
      await Standing.findOneAndUpdate({ tournament: tournament._id, team: d.teamId }, { $inc: d.inc }, { upsert:true, new:true, session });
    }
    return { applied: true };
  },

  rollbackResult: async ({ match, previousScore, session, tournament }) => {
    if (!previousScore) return { rolled: false };
    const teamA = match.teamA; const teamB = match.teamB;
    const runsA = Number(previousScore.teamARuns || previousScore.teamA || 0);
    const runsB = Number(previousScore.teamBRuns || previousScore.teamB || 0);
    const ptsWin = tournament?.pointsPerWin || 2; const ptsTie = tournament?.pointsPerDraw || 1;
    const delta = [];
    if (runsA === runsB) {
      delta.push({ teamId: teamA, inc: { played:-1, tied:-1, points: -ptsTie, runsFor: -runsA, runsAgainst: -runsB } });
      delta.push({ teamId: teamB, inc: { played:-1, tied:-1, points: -ptsTie, runsFor: -runsB, runsAgainst: -runsA } });
    } else if (runsA > runsB) {
      delta.push({ teamId: teamA, inc: { played:-1, won:-1, points: -ptsWin, runsFor: -runsA, runsAgainst: -runsB } });
      delta.push({ teamId: teamB, inc: { played:-1, lost:-1, runsFor: -runsB, runsAgainst: -runsA } });
    } else {
      delta.push({ teamId: teamB, inc: { played:-1, won:-1, points: -ptsWin, runsFor: -runsB, runsAgainst: -runsA } });
      delta.push({ teamId: teamA, inc: { played:-1, lost:-1, runsFor: -runsA, runsAgainst: -runsB } });
    }
    for (const d of delta) {
      await Standing.findOneAndUpdate({ tournament: tournament._id, team: d.teamId }, { $inc: d.inc }, { session });
    }
    return { rolled: true };
  }
};
