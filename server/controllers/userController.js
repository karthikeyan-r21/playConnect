const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, dob, mobile, location, profileImage } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dob = dob;
    if (mobile) updateData.mobile = mobile;
    if (location) updateData.location = location;
    if (profileImage) updateData.profileImage = profileImage;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "At least one field is required to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, select: "-password" }
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
};


 