// Replace this file with the definition of the data models

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true, // ensures username is stored in lowercase to avoid case sensitivity issues
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [20, "Username cannot exceed 20 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        match: [/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"]
    },
});

userSchema.pre('save', async function(next) { // pre means this function will run before saving a user to the database
    if (!this.isModified('password')) return next(); // if the password is not modified, skip hashing
    const salt = await bcrypt.genSalt(); // generate a salt
    this.password = await bcrypt.hash(this.password, salt); // hash the password with the salt
    next();
});

userSchema.methods.isValidPassword = async function(password) { //.method adds a method to the userSchema
  return await bcrypt.compare(password, this.password); // compare the provided password with the hashed password in the database
};


const User = mongoose.model('User', userSchema); // mongoose.model tells mongoose to create a collection named 'users' in the database and use the userSchema to define the structure of the documents in that collection

module.exports = User;