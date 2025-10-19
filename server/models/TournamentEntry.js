const mongoose = require('mongoose');
const { Schema } = mongoose;

const TournamentEntrySchema = new Schema({
  tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // who triggered request
  status: { type: String, enum: ['pending','accepted','rejected','withdrawn'], default: 'pending' },
  autoChecked: { type: Boolean, default: true }, // eligibility checked
  eligibilityFailures: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

TournamentEntrySchema.index({ tournament:1, team:1 }, { unique: true });

module.exports = mongoose.models.TournamentEntry || mongoose.model('TournamentEntry', TournamentEntrySchema);
