const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "playconnect_profiles" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

exports.register = async (req, res) => {
  try {
    // Debug: Log what we're receiving
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Fix: Handle potential trailing spaces in form field names
    const name = req.body.name || req.body['name '];
    const dob = req.body.dob || req.body['dob '];
    const location = req.body.location || req.body['location '];
    const email = req.body.email || req.body['email '];
    const mobile = req.body.mobile || req.body['mobile '];
    const password = req.body.password || req.body['password '];
    
    if (!name || !dob || !location || !email || !mobile || !password) {
      console.log('Missing fields check:');
      console.log('name:', name);
      console.log('dob:', dob);  
      console.log('location:', location);
      console.log('email:', email);
      console.log('mobile:', mobile);
      console.log('password:', password);
      return res.status(400).json({ msg: "All fields except profile image are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, dob, location, email, mobile, password: hashedPassword, profileImage: imageUrl
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "50d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email, profileImage: user.profileImage } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    let { email, password } = req.body;
    
    // Trim whitespace from email and password
    if (email) email = email.trim();
    if (password) password = password.trim();
    
    if (!email || !password) return res.status(400).json({ msg: "Email and password are required" });

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log('User found, comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log('Login successful, generating token');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email, profileImage: user.profileImage } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};
