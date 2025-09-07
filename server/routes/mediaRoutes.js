const express = require('express');
const router = express.Router();
const { uploadMedia } = require('../controllers/mediaUploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

// @route   POST /api/media/upload
// @desc    Upload media (video or image)
// @access  Private
router.post('/upload', auth, upload.single('media'), uploadMedia);

module.exports = router;
