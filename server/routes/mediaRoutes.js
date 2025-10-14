const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mediaUploadController = require("../controllers/mediaUploadController");
const { mediaUpload } = require("../middleware/multer");

// Upload media for user profile
router.post("/upload", auth, mediaUpload.single("media"), mediaUploadController.uploadUserMedia);

// View all media for a user
router.get("/user/:userId", auth, mediaUploadController.getUserMedia);

// View single media by mediaId
router.get("/:mediaId", auth, mediaUploadController.getSingleMedia);

// Delete media by mediaId
router.delete("/:mediaId", auth, mediaUploadController.deleteMedia);

// Future: Add routes for team and match media uploads
// router.post("/team/:teamId", auth, upload.single("file"), mediaUploadController.uploadTeamMedia);
// router.post("/match/:matchId", auth, upload.single("file"), mediaUploadController.uploadMatchMedia);

module.exports = router;