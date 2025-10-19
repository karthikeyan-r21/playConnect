const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  gameType: { 
    type: String, 
    enum: ['football','cricket','hockey','kabaddi','volleyball','badminton','tennis','other'],
    required: true,
    default: 'football'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date },
  status: { 
    type: String, 
    enum: ["upcoming", "ongoing", "completed", "scheduled", "running"], 
    default: "upcoming" 
  },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  minTeams: { type: Number, default: 2, min: 2 },
  maxTeams: { type: Number, default: 16, min: 2 },
  pointsPerWin: { type: Number, default: 3, min: 0 },
  pointsPerDraw: { type: Number, default: 1, min: 0 },
  autoGenerateOnMinReached: { type: Boolean, default: false },
  entryPolicy: {
    autoApprove: { type: Boolean, default: false },
    hostApprovalRequired: { type: Boolean, default: true }
  },
  logistics: {
    venue: { type: String, default: "" },
    venueGeo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  rules: { type: String, default: "" },
  ageLimit: { type: Number, default: 0, min: 0 }, // Legacy field for backward compatibility
  entryCriteria: {
    ageLimitMin: { type: Number, min: 0 },
    ageLimitMax: { type: Number, min: 0 },
    teamSizeLimit: {
      min: { type: Number, min: 1 },
      max: { type: Number, min: 1 }
    },
    genderCategory: { type: String, enum: ['Any', 'Male', 'Female'], default: 'Any' },
    maxTeams: { type: Number, min: 2 } // Fallback for tournament capacity
  },
  meta: {
    teamsCount: { type: Number, default: 0 }
  },
  // Legacy fields for backward compatibility
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
  brackets: { type: Array, default: [] },
  fixtures: [{ type: String }]
}, { timestamps: true });

// Index for geospatial queries
tournamentSchema.index({ "logistics.venueGeo": "2dsphere" });

// Pre-save middleware to sync host and createdBy
tournamentSchema.pre('save', function(next) {
  if (!this.createdBy && this.host) {
    this.createdBy = this.host;
  }
  if (!this.host && this.createdBy) {
    this.host = this.createdBy;
  }
  next();
});

module.exports = mongoose.model("Tournament", tournamentSchema);