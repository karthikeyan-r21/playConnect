const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  gameType: { type: String, required: true },
  date: { type: Date, required: true },
  // legacy human-readable location/address
  location: { type: String, required: true },
  // geoLocation stores exact coordinates as GeoJSON Point { type: 'Point', coordinates: [lng, lat] }
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false,
      default: [0, 0]
    }
  },
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

// add 2dsphere index for geospatial queries on matches
matchSchema.index({ geoLocation: '2dsphere' });

module.exports = mongoose.model("Match", matchSchema);