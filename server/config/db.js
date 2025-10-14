const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("📍 MongoDB URI:", process.env.MONGO_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') || 'Not found');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ MongoDB Connected Successfully!");
    console.log("📊 Database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:");
    console.error("🔍 Error Message:", err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.error("💡 Solution: Start MongoDB service or use MongoDB Atlas");
      console.error("   Local: Start-Service -Name 'MongoDB' (as admin)");
      console.error("   Cloud: Use MongoDB Atlas connection string");
    }
    
    process.exit(1); // Exit if DB connection fails
  }
};

module.exports = connectDB;
