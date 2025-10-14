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

app.use(cors());
app.use(express.json({ limit: '30mb' })); // Increase JSON limit
app.use(express.urlencoded({ extended: true, limit: '30mb' })); // Increase URL encoded limit

connectDB();


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/password", require("./routes/passwordRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/participants", require("./routes/participantsRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));

app.use("/api/media", require("./routes/mediaRoutes"));

// app.use("/api/media", require("./routes/mediaRoutes")); // Temporarily disabled


app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/match", require("./routes/participantsRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



  
 