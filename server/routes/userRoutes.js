const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { upload, mediaUpload } = require("../middleware/multer");

// Get current user's profile
router.get("/profile", auth, userController.getProfile);

// Update current user's profile
router.put("/updateProfile", auth, userController.updateProfile);

// Update current user's profile image
router.put("/updateProfileImage", auth, upload.single("profileImage"), userController.updateProfileImage);

// Media upload routes
router.post("/upload-media", auth, mediaUpload.single("media"), userController.uploadMedia);
router.get("/media", auth, userController.getUserMedia);
router.delete("/media/:mediaId", auth, userController.deleteMedia);

// Search users near a given location within a radius
router.get('/search-nearby', userController.searchNearbyUsers);

// Legacy route for backward compatibility
router.post("/uploadMedia", auth, mediaUpload.single("file"), userController.uploadMedia);

module.exports = router;
