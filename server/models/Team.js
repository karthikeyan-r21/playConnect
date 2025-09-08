const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sportType: { type: String, required: true }, 
  location: { type: String },
  minAge: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Pending join requests
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Team", teamSchema);