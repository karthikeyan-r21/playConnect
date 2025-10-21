const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  title: { type: String },
  gameType: { type: String, required: true },
  date: { type: Date }, // Legacy field
  scheduledDate: { type: Date }, // New field for tournament matches
  // legacy human-readable location/address
  location: { type: String },
  
  // Tournament-specific fields
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
  team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  team1Score: { type: Number, default: 0 },
  team2Score: { type: Number, default: 0 },
  round: { type: Number, default: 1 },
  matchNumber: { type: Number },
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
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { 
    type: String, 
    enum: ["upcoming", "completed", "cancelled", "scheduled", "in-progress"], 
    default: "upcoming" 
  },
  
  // Match result details
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  resultType: { 
    type: String, 
    enum: ["normal", "walkover", "forfeit", "draw"], 
    default: "normal" 
  },
  notes: { type: String }
}, { timestamps: true });

// add 2dsphere index for geospatial queries on matches
matchSchema.index({ geoLocation: '2dsphere' });

module.exports = mongoose.model("Match", matchSchema);