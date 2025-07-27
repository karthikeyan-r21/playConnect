const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../config/email");

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = async (req, res) => {
  try {
    console.log('Send OTP request body:', req.body);
    
    let { email } = req.body;
    
    // Trim whitespace from email
    if (email) email = email.trim();
    
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: "User not found" });
    }

    console.log('User found, generating OTP');
    
    // Clear any existing OTPs for this email
    await OTP.deleteMany({ email });
    
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Save OTP to database
    await OTP.create({ email, otp });
    
    // Send email with OTP
    try {
      await sendOTPEmail(email, otp);
      console.log('✅ OTP email sent successfully');
      res.status(200).json({ msg: "OTP sent to registered email" });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Fallback: Still save OTP but show in console
      console.log(`🟢 FALLBACK OTP for ${email}: ${otp}`);
      res.status(200).json({ 
        msg: "OTP generated but email sending failed. Check server logs for OTP."
      });
    }
    
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyOTPAndReset = async (req, res) => {
  try {
    console.log('Reset password request body:', req.body);
    
    let { email, otp, newPassword } = req.body;
    
    // Trim whitespace
    if (email) email = email.trim();
    if (otp) otp = otp.trim();
    if (newPassword) newPassword = newPassword.trim();
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: "Email, OTP, and new password are required" });
    }

    console.log('Looking for OTP:', { email, otp });
    
    // Find valid OTP
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      console.log('Invalid or expired OTP');
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    console.log('OTP verified, updating password');
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('Password reset successful');
    res.status(200).json({ msg: "Password reset successful" });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};
