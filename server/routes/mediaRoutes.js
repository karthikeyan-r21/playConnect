const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const auth = require('../middleware/auth');
const { mediaUpload } = require('../middleware/multer');

// Middleware to increase timeout for media uploads
const increaseTimeout = (req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
};

// @route   POST /api/media/upload
// @desc    Upload new media (video/image)
// @access  Private
router.post('/upload', increaseTimeout, auth, mediaUpload.single('media'), mediaController.uploadMedia);

// @route   GET /api/media
// @desc    Get all public media with optional filters
// @access  Public
router.get('/', mediaController.getAllMedia);

// @route   GET /api/media/:mediaId
// @desc    Get specific media by ID
// @access  Public
router.get('/:mediaId', mediaController.getMediaById);

// @route   GET /api/media/user/:userId
// @desc    Get media uploaded by specific user
// @access  Public
router.get('/user/:userId', mediaController.getUserMedia);

// @route   POST /api/media/:mediaId/like
// @desc    Like/Unlike media
// @access  Private
router.post('/:mediaId/like', auth, mediaController.toggleLike);

// @route   POST /api/media/:mediaId/comment
// @desc    Add comment to media
// @access  Private
router.post('/:mediaId/comment', auth, mediaController.addComment);

// @route   PUT /api/media/:mediaId
// @desc    Update media details (owner only)
// @access  Private
router.put('/:mediaId', auth, mediaController.updateMedia);

// @route   DELETE /api/media/:mediaId
// @desc    Delete media (owner only)
// @access  Private
router.delete('/:mediaId', auth, mediaController.deleteMedia);

module.exports = router;
