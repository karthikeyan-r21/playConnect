const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // Don't include password in queries by default
  mobile: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  profileImage: { type: String, default: "" },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

// Index for faster email lookups
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
