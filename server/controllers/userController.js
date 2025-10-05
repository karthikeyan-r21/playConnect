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
    let { geoLocation } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dob = dob;
    if (mobile) updateData.mobile = mobile;
    if (location) updateData.location = location;
    if (profileImage) updateData.profileImage = profileImage;

    // parse geoLocation if passed as JSON string (multipart forms)
    if (geoLocation && typeof geoLocation === 'string') {
      try { geoLocation = JSON.parse(geoLocation); } catch (e) { geoLocation = null; }
    }

    if (geoLocation && typeof geoLocation === 'object' && Array.isArray(geoLocation.coordinates)) {
      const [lng, lat] = geoLocation.coordinates.map(Number);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ msg: 'Invalid geoLocation coordinates' });
      }
      updateData.geoLocation = { type: 'Point', coordinates: [lng, lat] };
    }

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



exports.uploadMedia = async (req, res) => {
  try {
    const { type } = req.body; // "image" or "video"
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: type === "video" ? "video" : "image",
      folder: "playconnect_media",
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.media.push({ type, url: result.secure_url });
    await user.save();

    res.json({ msg: "Media uploaded successfully", media: user.media });
  } catch (err) {
    console.error("Error uploading media:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Search users near a location
exports.searchNearbyUsers = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000, limit = 50 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const geoNearStage = {
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distanceMeters',
        spherical: true,
        maxDistance: parseInt(maxDistance),
        query: {}
      }
    };

    const pipeline = [
      geoNearStage,
      { $limit: parseInt(limit) },
      // Exclude sensitive fields like password from the response
      { $project: { password: 0 } }
    ];
    const users = await User.aggregate(pipeline);
    res.json({ users });
  } catch (err) {
    console.error('Error searching nearby users:', err);
    res.status(500).json({ message: 'Error searching nearby users', error: err.message });
  }
};