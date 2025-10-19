const mongoose = require('mongoose');
const { Schema } = mongoose;

const TournamentMatchSchema = new Schema({
  tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
  round: Number,
  parentMatchA: { type: Schema.Types.ObjectId, ref: 'TournamentMatch' },
  parentMatchB: { type: Schema.Types.ObjectId, ref: 'TournamentMatch' },
  nextMatch: { type: Schema.Types.ObjectId, ref: 'TournamentMatch' },
  homeTeam: { type: String, enum: ['A','B', null], default: null },
  teamA: { type: Schema.Types.ObjectId, ref: 'Team' },
  teamB: { type: Schema.Types.ObjectId, ref: 'Team' },
  scheduledAt: Date,
  venue: String,
  venueGeo: { type: { type: String, enum:['Point'], default:'Point' }, coordinates: [Number] }, // [lng, lat]
  score: { teamA: { type: Number, default: 0 }, teamB: { type: Number, default: 0 } },
  // sport-specific result holder and handler key
  result: {
    winner: { type: Schema.Types.ObjectId, ref: 'Team' },
    score: Object,
    sportSpecific: Schema.Types.Mixed
  },
  resultHandler: { type: String }, // e.g. 'football','cricket','tennis'
  status: { type: String, enum: ['scheduled','live','finished','cancelled'], default: 'scheduled' },
  resultRecordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resultHistory: [{ recordedAt: Date, by: { type: Schema.Types.ObjectId, ref: 'User' }, score: Object, note: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.TournamentMatch || mongoose.model('TournamentMatch', TournamentMatchSchema);
