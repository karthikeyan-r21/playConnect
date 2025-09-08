const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files
// Get current user's profile
router.get("/profile/:userId", auth, userController.getProfile);

// Update current user's profile
router.put("/updateProfile/:userId", auth, userController.updateProfile);


module.exports = router;
