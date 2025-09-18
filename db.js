const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file
const mongoose = require("mongoose");
const { DB_PASSWORD } = process.env;

module.exports = {
  connectDb: async () => {
    try {
      await mongoose.connect(`mongodb+srv://AndrewL1498:${DB_PASSWORD}@dogsdb.au7kucq.mongodb.net/DogDb?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("Connected to MongoDB via Mongoose");
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      throw err;
    }
  }
};