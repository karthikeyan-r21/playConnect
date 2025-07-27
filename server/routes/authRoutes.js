const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { register, login } = require("../controllers/authController");

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);

module.exports = router;
