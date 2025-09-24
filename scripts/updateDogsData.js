const mongoose = require("mongoose");
const Dog = require("../models/DogModel");// imports the Dog model
const dotenv = require("dotenv"); // import dotenv
dotenv.config(); // Load environment variables from .env file
const { MONGODB_URI } = process.env; // get the MongoDB connection string from environment variables


async function updateDogs() { 
  await mongoose.connect(MONGODB_URI);

  // Update all dogs that don't have the new fields
  await Dog.updateMany( //update many is imported from mongoose and is used to update multiple documents in a collection that match a specified filter
    { owner: { $exists: false } }, // Only dogs missing the owner field
    { $set: { owner: null, adoptedBy: null, thankYouMessage: "" } }
  );

  console.log("All dogs updated!");
  mongoose.disconnect();
}

updateDogs();
