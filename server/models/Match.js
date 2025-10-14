const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  gameType: { type: String, required: true },
  date: { type: Date, required: true },
  // legacy human-readable location/address
  location: { type: String, required: true },
  // geoLocation stores comprehensive location details with coordinates
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] format for MongoDB
      required: false,
      default: [0, 0]
    },
    // Detailed location information
    name: { type: String, required: false }, // Primary name (e.g., "Central Park Stadium")
    address: { type: String, required: false }, // Full formatted address
    city: { type: String, required: false }, // City name
    state: { type: String, required: false }, // State/Province
    country: { type: String, required: false }, // Country
    pincode: { type: String, required: false }, // ZIP/Pin code
    placeId: { type: String, required: false }, // Google Places ID or SerpAPI ID
    types: [{ type: String }], // Place types (e.g., ['stadium', 'establishment'])
    rating: { type: Number, required: false }, // Place rating if available
    phone: { type: String, required: false }, // Contact number if available
    website: { type: String, required: false } // Website if available
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