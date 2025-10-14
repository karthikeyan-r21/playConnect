const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sportType: { type: String, required: true }, 
  // GeoJSON location for geospatial queries
  location: {
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
  // human readable address (keeps legacy string addresses separate from GeoJSON)
  address: { type: String },
  minAge: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Pending join requests
  createdAt: { type: Date, default: Date.now },
});

// Create 2dsphere index for location
teamSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Team", teamSchema);