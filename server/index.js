const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Increase timeout for file uploads
app.use((req, res, next) => {
  // Set timeout to 5 minutes for media uploads
  if (req.path.includes('/media')) {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  }
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '30mb' })); // Increase JSON limit
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Increase URL encoded limit

connectDB();


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/password", require("./routes/passwordRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/participants", require("./routes/participantsRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/media", require("./routes/mediaRoutes")); // Media routes enabled

app.use("/api/notifications", require("./routes/notificationRoutes"));

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      msg: 'File too large. Maximum size is 50MB for videos and 5MB for images.' 
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      msg: 'Too many files. Upload one file at a time.' 
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      msg: 'Unexpected file field. Use "media" as the field name.' 
    });
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      msg: error.message 
    });
  }
  
  // Generic server error
  res.status(500).json({ 
    msg: 'Server error occurred', 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//Media upload testing pending
//Profile update testing pending
 