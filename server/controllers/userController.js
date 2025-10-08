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

// Update current user's profile image
exports.updateProfileImage = async (req, res) => {
  try {
    console.log('Profile image update request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ msg: "No profile image uploaded" });
    }

    console.log('Uploading profile image to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer, 'image');
    console.log('Profile image upload successful:', result.secure_url);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true, select: "-password" }
    );
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ 
      msg: "Profile image updated successfully", 
      user,
      profileImage: result.secure_url 
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};



const uploadToCloudinary = (fileBuffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "playconnect_media",
        resource_type: resourceType,
        quality: "auto:best",
        fetch_format: "auto"
      },
      (err, result) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          reject(err);
        } else {
          console.log('Cloudinary upload successful:', result.secure_url);
          resolve(result);
        }
      }
    );
    stream.end(fileBuffer);
  });
};

exports.uploadMedia = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File info:', {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Determine file type and resource type for Cloudinary
    const isVideo = req.file.mimetype.startsWith('video/');
    const fileType = isVideo ? 'video' : 'image';
    const resourceType = isVideo ? 'video' : 'image';
    
    console.log('File type detected:', fileType, 'Resource type:', resourceType);

    console.log('Uploading to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer, resourceType);
    console.log('Cloudinary upload completed');

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: "User not found" });
    }

    // Add media to user's media array
    const mediaItem = {
      type: fileType,
      url: result.secure_url,
      filename: req.file.originalname,
      uploadDate: new Date()
    };
    
    user.media.push(mediaItem);
    await user.save();
    console.log('Media saved to user profile. Total media:', user.media.length);

    res.json({ 
      msg: "Media uploaded successfully", 
      media: mediaItem,
      totalMedia: user.media.length 
    });
  } catch (err) {
    console.error("Error uploading media:", err);
    res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};

// Get user's media
exports.getUserMedia = async (req, res) => {
  try {
    console.log('Getting user media for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('media');
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: "User not found" });
    }

    console.log('User media found:', user.media.length, 'items');
    res.json({ media: user.media || [] });
  } catch (err) {
    console.error("Error getting user media:", err);
    res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};

// Delete user's media
exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    console.log('Deleting media:', mediaId, 'for user:', req.user.id);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: "User not found" });
    }

    // Find and remove the media item
    const mediaIndex = user.media.findIndex(item => item._id.toString() === mediaId);
    if (mediaIndex === -1) {
      console.log('Media not found');
      return res.status(404).json({ msg: "Media not found" });
    }

    user.media.splice(mediaIndex, 1);
    await user.save();
    console.log('Media deleted successfully');

    res.json({ msg: "Media deleted successfully", remainingMedia: user.media.length });
  } catch (err) {
    console.error("Error deleting media:", err);
    res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};