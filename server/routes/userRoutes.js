const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/multer");

// Get current user's profile
router.get("/profile", auth, userController.getProfile);

// Update current user's profile
router.put("/updateProfile", auth, userController.updateProfile);

// Search users near a given location within a radius
router.get('/search-nearby', userController.searchNearbyUsers);

router.post("/uploadMedia", auth, upload.single("file"), userController.uploadMedia);

module.exports = router;
