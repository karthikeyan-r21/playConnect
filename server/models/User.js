const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  mobile: String,
  dob: Date,
  location: String,
  profileImage: String,
  media: [
    {
      type: { type: String, enum: ["image", "video"] },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
