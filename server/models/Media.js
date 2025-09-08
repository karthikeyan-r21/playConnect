const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number // in seconds, for videos
  },
  sportType: {
    type: String,
    required: true,
    enum: [
      'Football', 'Basketball', 'Tennis', 'Cricket', 'Soccer', 'Baseball',
      'Swimming', 'Volleyball', 'Rugby', 'Hockey', 'Golf', 'Boxing',
      'Cycling', 'Running', 'Badminton', 'Table Tennis', 'Wrestling'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  cloudinaryId: {
    type: String // For storing Cloudinary public_id
  }
}, {
  timestamps: true
});

// Index for better query performance
MediaSchema.index({ sportType: 1, createdAt: -1 });
MediaSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Media', MediaSchema);
