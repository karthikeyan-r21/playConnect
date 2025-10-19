const mongoose = require('mongoose');
const { Schema } = mongoose;

const StandingSchema = new Schema({
  tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDiff: { type: Number, default: 0 },
  // Sport-specific aggregates
  runsFor: { type: Number, default: 0 },
  runsAgainst: { type: Number, default: 0 },
  setsFor: { type: Number, default: 0 },
  setsAgainst: { type: Number, default: 0 },
  raidPoints: { type: Number, default: 0 },
  tacklePoints: { type: Number, default: 0 },
  pointsFor: { type: Number, default: 0 },
  pointsAgainst: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  lastMatches: [{ matchId: Schema.Types.ObjectId, score: Object, result: String, date: Date }],
  updatedAt: Date
});

StandingSchema.index({ tournament:1, team:1 }, { unique:true });

module.exports = mongoose.models.Standing || mongoose.model('Standing', StandingSchema);
