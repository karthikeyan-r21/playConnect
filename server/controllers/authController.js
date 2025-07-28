const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile) => {
  const mobileRegex = /^\d{10,15}$/;
  const cleanMobile = mobile.replace(/[\s\-\+\(\)]/g, '');
  return mobileRegex.test(cleanMobile);
};

const validatePassword = (password) => {
  // At least 6 characters, contains at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
};

const validateAge = (dob) => {
  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) return false;
  
  const age = new Date().getFullYear() - dobDate.getFullYear();
  const monthDiff = new Date().getMonth() - dobDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < dobDate.getDate())) {
    age--;
  }
  
  return age >= 13 && age <= 120; // Must be between 13 and 120 years old
};

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
    console.log('Registration request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Extract and trim fields
    let name = (req.body.name || req.body['name '] || '').trim();
    let email = (req.body.email || req.body['email '] || '').trim().toLowerCase();
    let password = (req.body.password || req.body['password '] || '').trim();
    let mobile = (req.body.mobile || req.body['mobile '] || '').trim();
    let dob = (req.body.dob || req.body['dob '] || '').trim();
    let location = (req.body.location || req.body['location '] || '').trim();
    
    // 1. Check required fields
    if (!name || !email || !password || !mobile || !dob || !location) {
      return res.status(400).json({ 
        success: false,
        msg: "All fields except profile image are required",
        missingFields: {
          name: !name,
          email: !email,
          password: !password,
          mobile: !mobile,
          dob: !dob,
          location: !location
        }
      });
    }

    // 2. Validate name
    if (!validateName(name)) {
      return res.status(400).json({ 
        success: false,
        msg: "Name should only contain letters and spaces (2-50 characters)" 
      });
    }

    // 3. Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        msg: "Please enter a valid email address" 
      });
    }

    // 4. Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false,
        msg: "Password must be at least 6 characters long and contain at least one letter and one number" 
      });
    }

    // 5. Validate mobile number
    if (!validateMobile(mobile)) {
      return res.status(400).json({ 
        success: false,
        msg: "Please enter a valid mobile number (10-15 digits)" 
      });
    }

    // 6. Validate date of birth and age
    if (!validateAge(dob)) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid date of birth or age must be between 13 and 120 years" 
      });
    }

    // 7. Validate location
    if (location.length < 2 || location.length > 100) {
      return res.status(400).json({ 
        success: false,
        msg: "Location must be between 2 and 100 characters" 
      });
    }

    // 8. Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        msg: "User with this email already exists" 
      });
    }

    // 9. Validate and upload profile image (if provided)
    let imageUrl = "";
    if (req.file) {
      console.log('Processing profile image upload');
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          success: false,
          msg: "Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed" 
        });
      }

      // Validate file size (5MB max)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          success: false,
          msg: "File size too large. Maximum 5MB allowed" 
        });
      }

      try {
        imageUrl = await uploadToCloudinary(req.file.buffer);
        console.log('Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ 
          success: false,
          msg: "Failed to upload profile image" 
        });
      }
    }

    // 10. Hash password
    console.log('Hashing password');
    const saltRounds = 12; // Increased from 10 for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 11. Create user
    console.log('Creating user in database');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      dob: new Date(dob),
      location,
      profileImage: imageUrl
    });

    console.log('User created successfully:', user._id);

    // 12. Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // 13. Send success response (don't send password)
    res.status(201).json({ 
      success: true,
      msg: "User registered successfully",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile,
        dob: user.dob,
        location: user.location,
        profileImage: user.profileImage 
      } 
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false,
        msg: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      msg: "Internal server error during registration" 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login request received');
    console.log('Request body:', req.body);
    
    // Extract and trim fields
    let { email, password } = req.body;
    
    if (email) email = email.trim().toLowerCase();
    if (password) password = password.trim();

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: "Email and password are required",
        missingFields: {
          email: !email,
          password: !password
        }
      });
    }

    // 2. Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        msg: "Please enter a valid email address" 
      });
    }

    // 3. Validate password (basic length check)
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        msg: "Password must be at least 6 characters long" 
      });
    }

    // 4. Find user by email
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ 
        success: false,
        msg: "Invalid email or password" 
      });
    }

    console.log('User found, verifying password');

    // 5. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return res.status(401).json({ 
        success: false,
        msg: "Invalid email or password" 
      });
    }

    console.log('Password verified successfully');

    // 6. Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // 7. Update last login (optional)
    await User.findByIdAndUpdate(user._id, { 
      lastLogin: new Date() 
    });

    console.log('Login successful for user:', user._id);

    // 8. Send success response (don't send password)
    res.status(200).json({ 
      success: true,
      msg: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        location: user.location,
        profileImage: user.profileImage 
      } 
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      msg: "Internal server error during login" 
    });
  }
};
