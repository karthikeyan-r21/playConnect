const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/password", require("./routes/passwordRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/participants", require("./routes/participantsRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));