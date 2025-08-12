const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  gameType: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, default: "" },
  maxPlayers: { type: Number, default: 10, min: 2 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { 
    type: String, 
    enum: ["upcoming", "completed", "cancelled"], 
    default: "upcoming" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);