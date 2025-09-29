const mongoose = require("mongoose");
const Dog = require("../models/DogModel");
const dotenv = require("dotenv");
dotenv.config();
const { MONGODB_URI } = process.env;

async function updateDogs() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB:", MONGODB_URI);

  await Dog.updateMany(
    {},
    [
      {
        $set: {
          status: {
            $cond: [{ $ne: ["$adoptedBy", null] }, "Adopted", "Available"]
          }
        }
      }
    ]
  );

  console.log("All dogs updated!");
  await mongoose.disconnect();
}

updateDogs();

