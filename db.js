const dotenv = require("dotenv"); // Add this line to import dotenv
dotenv.config(); // Load environment variables from .env file
const mongoose = require("mongoose");
const { MONGODB_URI } = process.env;

module.exports = {
  connectDb: async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB via Mongoose");
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      throw err;
    }
  }
};