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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

});

const Dog = mongoose.model('Dog', dogSchema);

module.exports = Dog;