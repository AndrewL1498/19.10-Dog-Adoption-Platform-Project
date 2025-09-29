const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Dog name is required"],
        minlength: [2, "Dog name must be at least 2 characters long"],
        maxlength: [30, "Dog name cannot exceed 30 characters"]
    },

    description: {
        type: String,
        required: [true, "Dog description is required"],
        minlength: [10, "Description must be at least 10 characters long"],
        maxlength: [300, "Description cannot exceed 300 characters"]
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId, // This field will store the ObjectId of the user who created the dog profile
        ref: 'User', // Reference to the User model
        required: true // Owner is required
    },

    adoptedBy: {
        type: mongoose.Schema.Types.ObjectId, // This field will store the ObjectId of the user who adopted the dog
        ref: 'User', // Reference to the User model
        default: null // Default is null, meaning the dog is not adopted yet
    },

    thankYouMessage: {
        type: String,
        maxlength: [500, "Thank you message cannot exceed 500 characters"],
        default: ""
    },

    status: {
        type: String,
        enum: ['Available', 'Adopted', 'Removed'],
        default: 'Available'
    }
});

const Dog = mongoose.model('Dog', dogSchema); //a mongoose model is like a series of functions you can use to engage with the database. Mongoose does automatic lower casing and pluralization of the model name (Dogs in this case) and look for a database that matches, aka "dogs". dogschema tells mongoose the structure of my documents

module.exports = Dog;