const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
  rules: { type: String, default: "" },
ageLimit: { type: Number, default: 0 },  
  brackets: { type: Array, default: [] }, // For future bracket logic
  fixtures: [{ type: String }], // List of fixture descriptions
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);
