const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "playconnect_media",
        resource_type: resourceType,
        timeout: 300000, // 5 minutes timeout
        chunk_size: 6000000, // 6MB chunks for large files
        eager_async: true, // Process transformations asynchronously
        format: resourceType === 'video' ? 'mp4' : undefined // Ensure consistent video format
      },
      (err, result) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          reject(err);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    stream.end(fileBuffer);
  });
};

exports.uploadMedia = async (req, res) => {
  try {
    const { type } = req.body; // "image" or "video"
    if (!type || !["image", "video"].includes(type)) {
      return res.status(400).json({ msg: "Invalid media type" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Check file size limits
    const maxSize = type === "video" ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        msg: `File size too large. Maximum ${type === "video" ? "25MB" : "5MB"} allowed.` 
      });
    }

    // Determine resource type for Cloudinary
    const resourceType = type === "video" ? "video" : "image";
    
    const mediaUrl = await uploadToCloudinary(req.file.buffer, resourceType);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.media.push({ type, url: mediaUrl });
    await user.save();

    res.json({ msg: "Media uploaded successfully", media: user.media });
  } catch (err) {
    console.error("Error uploading media:", err);
    
    // Handle specific multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: "File size too large" });
    }
    
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({ msg: err.message });
    }
    
    res.status(500).json({ msg: "Internal server error" });
  }
};