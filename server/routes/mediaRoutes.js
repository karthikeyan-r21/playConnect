const express = require('express');
const router = express.Router();
const { uploadMedia } = require('../controllers/mediaUploadController');
const auth = require('../middleware/auth');
const { mediaUpload } = require('../middleware/multer');

// Middleware to increase timeout for media uploads
const increaseTimeout = (req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
};

// @route   POST /api/media/upload
// @desc    Upload media (video or image)
// @access  Private
router.post('/upload', increaseTimeout, auth, mediaUpload.single('media'), uploadMedia);

module.exports = router;
