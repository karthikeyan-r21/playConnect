const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create different upload configurations for different use cases
const createUpload = (fileSize, fileFilter) => {
  return multer({ 
    storage,
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

// Default upload (for profile pictures - 5MB limit)
const upload = createUpload(5 * 1024 * 1024);

// Media upload (for talent showcase - 50MB limit for videos)
const mediaUpload = createUpload(50 * 1024 * 1024, mediaFileFilter);

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
