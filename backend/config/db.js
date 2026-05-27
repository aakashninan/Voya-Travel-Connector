const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.error("⚠️ CRITICAL ERROR: process.env.MONGO_URI is undefined. Check Render Environment settings.");
    }

    // Force Mongoose to connect to the cloud URI
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Forcefully close the crashing process so Render knows it failed immediately
  }
};

module.exports = connectDB;