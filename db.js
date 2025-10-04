const dotenv = require("dotenv"); // Add this line to import dotenv
dotenv.config(); // Load environment variables from .env file
const mongoose = require("mongoose");


const MONGODB_URI = process.env.NODE_ENV === "test"
  ? process.env.MONGODB_URI_TEST
  : process.env.MONGODB_URI;

module.exports = {
  connectDb: async () => {
    try {
      await mongoose.connect(MONGODB_URI);
    } catch (err) {
      throw err;
    }
  },
  connection: mongoose.connection
};