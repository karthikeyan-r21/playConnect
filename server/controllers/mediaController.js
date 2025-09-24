const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// @desc    Upload new media (video/image)
// @route   POST /api/media/upload
// @access  Private
const uploadMedia = async (req, res) => {
  try {
    const { title, sportType, description, tags } = req.body;
    
    // Validation
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Determine file type
    const isVideo = req.file.mimetype.startsWith('video/');
    const isImage = req.file.mimetype.startsWith('image/');
    
    if (!isVideo && !isImage) {
      return res.status(400).json({ message: 'Only video and image files are allowed' });
    }

    // File size validation
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: `File too large. Max ${isVideo ? '100MB' : '10MB'} allowed.` 
      });
    }

    // Upload to Cloudinary with optimized settings
    const uploadOptions = {
      folder: "playconnect_media",
      resource_type: isVideo ? "video" : "image",
    };

    // Add video-specific optimizations for browser compatibility
    if (isVideo) {
      uploadOptions.format = 'mp4';
      uploadOptions.video_codec = 'h264';
      uploadOptions.audio_codec = 'aac';
      uploadOptions.quality = 'auto:good';
      uploadOptions.flags = 'progressive';
      uploadOptions.streaming_profile = 'hd';
    }

    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    // Get user information
    const user = await User.findById(req.user.id).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create media object
    const mediaData = {
      _id: result.public_id,
      title: title.trim(),
      fileType: isVideo ? 'video' : 'image',
      fileUrl: result.secure_url,
      uploadedBy: {
        _id: req.user.id,
        name: user.name
      },
      sportType: sportType || 'General',
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      likes: [],
      comments: [],
      views: 0,
      duration: result.duration || 0, // Video duration in seconds
      fileSize: result.bytes || 0,
      format: result.format,
      publicId: result.public_id,
      createdAt: new Date().toISOString()
    };

    // Optionally save to user's media array
    user.media = user.media || [];
    user.media.push({
      type: isVideo ? 'video' : 'image',
      url: result.secure_url,
      title: title,
      publicId: result.public_id
    });
    await user.save();

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      media: mediaData
    });

  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ message: 'Server error during media upload' });
  }
};

// @desc    Get all public media with optional filters
// @route   GET /api/media
// @access  Public
const getAllMedia = async (req, res) => {
  try {
    // Return mock media data for now
    const mockMedia = [
      {
        _id: 'mock-1',
        title: 'Football Training Session',
        fileType: 'video',
        fileUrl: 'https://via.placeholder.com/400x300',
        thumbnail: 'https://via.placeholder.com/400x300',
        uploadedBy: {
          _id: 'user-1',
          name: 'John Doe'
        },
        sportType: 'Football',
        description: 'Great training session highlights',
        tags: ['training', 'football'],
        likes: [],
        comments: [],
        views: 25,
        duration: 120,
        fileSize: 15728640,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mock-2',
        title: 'Basketball Highlights',
        fileType: 'video',
        fileUrl: 'https://via.placeholder.com/400x300',
        thumbnail: 'https://via.placeholder.com/400x300',
        uploadedBy: {
          _id: 'user-2',
          name: 'Jane Smith'
        },
        sportType: 'Basketball',
        description: 'Best plays from last game',
        tags: ['highlights', 'basketball'],
        likes: [],
        comments: [],
        views: 42,
        duration: 90,
        fileSize: 12582912,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      media: mockMedia,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockMedia.length
      }
    });
  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({ message: 'Server error fetching media' });
  }
};

// @desc    Get specific media by ID
// @route   GET /api/media/:mediaId
// @access  Public
const getMediaById = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get media by ID feature coming soon',
      mediaId: req.params.mediaId
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({ message: 'Server error fetching media' });
  }
};

// @desc    Get media uploaded by specific user
// @route   GET /api/media/user/:userId
// @access  Public
const getUserMedia = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get user media feature coming soon',
      userId: req.params.userId,
      media: []
    });
  } catch (error) {
    console.error('Get user media error:', error);
    res.status(500).json({ message: 'Server error fetching user media' });
  }
};

// @desc    Like/Unlike media
// @route   POST /api/media/:mediaId/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Like toggle feature coming soon',
      mediaId: req.params.mediaId,
      liked: true
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

// @desc    Add comment to media
// @route   POST /api/media/:mediaId/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Add comment feature coming soon',
      mediaId: req.params.mediaId,
      comment: {
        _id: 'mock-comment-id',
        text: req.body.text,
        user: {
          _id: req.user?.id || 'mock-user-id',
          name: req.user?.name || 'Mock User'
        },
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Update media details (owner only)
// @route   PUT /api/media/:mediaId
// @access  Private
const updateMedia = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Update media feature coming soon',
      mediaId: req.params.mediaId
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ message: 'Server error updating media' });
  }
};

// @desc    Delete media (owner only)
// @route   DELETE /api/media/:mediaId
// @access  Private
const deleteMedia = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Delete media feature coming soon',
      mediaId: req.params.mediaId
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ message: 'Server error deleting media' });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaById,
  getUserMedia,
  toggleLike,
  addComment,
  updateMedia,
  deleteMedia
};
