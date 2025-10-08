const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { upload, mediaUpload } = require("../middleware/multer");

// Get current user's profile
router.get("/profile", auth, userController.getProfile);

// Update current user's profile
router.put("/updateProfile", auth, userController.updateProfile);

// Update profile image
router.put("/updateProfileImage", auth, upload.single("profileImage"), userController.updateProfileImage);

// Media upload
router.post("/upload-media", auth, mediaUpload.single("media"), userController.uploadMedia);

// Get user's media
router.get("/media", auth, userController.getUserMedia);

// Delete user's media
router.delete("/media/:mediaId", auth, userController.deleteMedia);

module.exports = router;
