const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const mediaUploadController = require("../controllers/mediaUploadController");
const auth = require("../middleware/auth");
const upload = require("../middleware/multer");

// Get current user's profile
router.get("/profile/:userId", auth, userController.getProfile);

// Update current user's profile
router.put("/updateProfile/:userId", auth, userController.updateProfile);


router.post("/uploadMedia", auth, upload.single("file"), mediaUploadController.uploadUserMedia);


module.exports = router;
