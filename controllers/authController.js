// Replace this file with the logic for handling incoming requests and returning responses to the client

// controllers/authController.js
const User = require("../models/UserModel");
const { generateToken, attachTokenToCookie } = require("../helpers/jwt");


const home = {
    get: (req, res) => {
        res.render("home");
    }
};

const signup = {
  get: (req, res) => {
    res.render("signup");
  },
  post: async (req, res, next) => {
    try {
      const { username, password } = req.body;

       if (!username?.trim() || !password?.trim()) { //The ? checks if username and password are not null or undefined before calling trim()
      return res.status(400).json({ error: "Username and password are required" });
    }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const newUser = new User({ username, password });
      await newUser.save();
      res.status(201).json({message: "User registered successfully"});
     
    } catch (error) {

      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }

       return res.status(500).json({ error: "Internal server error" });
    }
  }
};

const login = {
  get: (req, res) => {
    res.render("login");
  },
  post: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      const userPassword = user ? await user.isValidPassword(password) : false; // Check if user exists before calling isValidPassword. Otherwise if user returns null then checking for a valid password will result in a typer error

      if (!user || !userPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = generateToken(user);
      attachTokenToCookie(res, token);

      res.status(200).json({ message: "Login successful" });

   } catch (error) {
      next(error);
   }
  }
};

module.exports = { home, signup, login };
