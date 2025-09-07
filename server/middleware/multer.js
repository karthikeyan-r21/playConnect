const multer = require("multer");

const storage = multer.memoryStorage();

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
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, WebM, OGG, AVI, MOV) are allowed.'));
  }
};

// Default upload (for profile pictures - 5MB limit)
const upload = createUpload(5 * 1024 * 1024);

// Media upload (for talent showcase - 25MB limit)
const mediaUpload = createUpload(25 * 1024 * 1024, mediaFileFilter);

module.exports = {
  upload,
  mediaUpload
};
