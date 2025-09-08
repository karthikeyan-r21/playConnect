const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Upload media for user profile
exports.uploadUserMedia = async (req, res) => {
  try {
    const { type, isProfileImage } = req.body; // "image" or "video", optional isProfileImage
    // Allowed types and extensions
    const allowedTypes = ["image", "video"];
    const allowedImageExt = ["jpg", "jpeg", "png", "gif"];
    const allowedVideoExt = ["mp4", "mov", "avi", "webm"];
    const maxFileSize = 50 * 1024 * 1024; // 10MB
    const maxMediaCount = 10;

    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ msg: "Invalid media type" });
    }
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    // File size check
    if (req.file.size > maxFileSize) {
      return res.status(400).json({ msg: "File too large. Max 10MB allowed." });
    }
    // Extension check
    const ext = req.file.originalname.split(".").pop().toLowerCase();
    if (type === "image" && !allowedImageExt.includes(ext)) {
      return res.status(400).json({ msg: "Invalid image file type" });
    }
    if (type === "video" && !allowedVideoExt.includes(ext)) {
      return res.status(400).json({ msg: "Invalid video file type" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // Max media count check
    if (user.media.length >= maxMediaCount) {
      return res.status(400).json({ msg: `Max ${maxMediaCount} media uploads allowed.` });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: type === "video" ? "video" : "image",
      folder: "playconnect_media",
    });

    // Add to media array
    user.media.push({ type, url: result.secure_url });

    // Optionally set as profile image
    if (isProfileImage === "true" || isProfileImage === true) {
      user.profileImage = result.secure_url;
    }

    await user.save();

    res.json({ msg: "Media uploaded successfully", media: user.media, profileImage: user.profileImage });
  } catch (err) {
    console.error("Error uploading media:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};


// View all media for a user
exports.getUserMedia = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ media: user.media });
  } catch (err) {
    console.error("Error fetching user media:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// View single media by mediaId
exports.getSingleMedia = async (req, res) => {
  try {
    // Find user containing this mediaId
    const user = await User.findOne({ "media._id": req.params.mediaId });
    if (!user) {
      return res.status(404).json({ msg: "Media not found" });
    }
    const media = user.media.id(req.params.mediaId);
    if (!media) {
      return res.status(404).json({ msg: "Media not found" });
    }
    res.json({ media });
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

exports.getSingleMedia = async (req, res) => {
  try {
    // Find user containing this mediaId
    const user = await User.findOne({ "media._id": req.params.mediaId });
    if (!user) {
      return res.status(404).json({ msg: "Media not found" });
    }
    const media = user.media.id(req.params.mediaId);
    if (!media) {
      return res.status(404).json({ msg: "Media not found" });
    }
    res.json({ media });
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Delete media by mediaId
exports.deleteMedia = async (req, res) => {
  try {
    const user = await User.findOne({ "media._id": req.params.mediaId });
    if (!user) {
      return res.status(404).json({ msg: "Media not found" });
    }
    const media = user.media.id(req.params.mediaId);
    if (!media) {
      return res.status(404).json({ msg: "Media not found" });
    }
    // Optionally: delete from Cloudinary (if you store public_id)
    user.media.pull(req.params.mediaId);
    await user.save();
    res.json({ msg: "Media deleted successfully" });
  } catch (err) {
    console.error("Error deleting media:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};