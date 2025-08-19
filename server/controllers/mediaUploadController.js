const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

exports.uploadMedia = async (req, res) => {
  try {
    const { type } = req.body; // "image" or "video"
    if (!type || !["image", "video"].includes(type)) {
      return res.status(400).json({ msg: "Invalid media type" });
    }

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