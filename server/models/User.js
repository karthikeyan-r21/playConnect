const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  mobile: String,
  dob: Date,
  // legacy human-readable address
  location: String,
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
  profileImage: String,
  media: [
    {
      type: { type: String, enum: ["image", "video"] },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// add 2dsphere index for geospatial queries on users
userSchema.index({ geoLocation: '2dsphere' });

module.exports = mongoose.model("User", userSchema);
