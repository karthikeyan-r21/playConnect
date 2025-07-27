const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTPAndReset } = require("../controllers/passwordController");

router.post("/forgot-password", sendOTP);
router.post("/reset-password", verifyOTPAndReset);

module.exports = router;
