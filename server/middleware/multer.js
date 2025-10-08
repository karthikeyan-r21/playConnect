const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist (for fallback disk storage)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage for files that need to be saved locally
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Memory storage for direct upload to Cloudinary (like profile images and media)
const memoryStorage = multer.memoryStorage();

// Create different upload configurations for different use cases
const createUpload = (fileSize, fileFilter, useMemory = false) => {
  return multer({ 
    storage: useMemory ? memoryStorage : diskStorage,
    limits: {
      fileSize: fileSize
    },
    fileFilter: fileFilter
  });
};

// File filter for media uploads (images and videos)
const mediaFileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, AVI, MOV) are allowed.'));
  }
};

// Default upload (for profile pictures - 5MB limit, memory storage)
const upload = createUpload(5 * 1024 * 1024, null, true);

// Media upload (for talent showcase - 100MB limit for videos, memory storage)
const mediaUpload = createUpload(100 * 1024 * 1024, mediaFileFilter, true);

// Video-specific upload with higher limit
const videoUpload = createUpload(100 * 1024 * 1024, (req, file, cb) => {
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
  
  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Only MP4, WebM, OGG, AVI, and MOV files are allowed.'));
  }
});

module.exports = {
  upload,
  mediaUpload,
  videoUpload,
  single: (fieldName) => upload.single(fieldName)
};
