// Replace this file with the logic for handling incoming requests and returning responses to the client

// controllers/authController.js
const User = require("../models/UserModel");

const home = {
    get: (req, res) => {
        res.render("home");
    }
};

const signup = {
  get: (req, res) => {
    res.render("signup");
  },
  post: async (req, res) => {
    try {
      const { username, password } = req.body;

       if (!username?.trim() || !password?.trim()) { //The ? checks if username and password are not null or undefined before calling trim()
      return res.status(400).json({ error: "Username and password are required" });
    }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({error: "Username already exists"});
      }

      const newUser = new User({ username, password });
      await newUser.save();
      res.status(201).json({message: "User registered successfully"});
    } catch (error) {

      if (error.name === 'ValidationError') {
        return res.status(400).json({error: error.message});
      }

      console.error("Error in signup:", error);
      res.status(500).json({error: "Internal server error"});
    }
  }
};

const login = {
  get: (req, res) => {
    res.render("login");
  },
  post: (req, res) => {
    console.log(req.body);
    res.send("user logged in");
  }
};

const logout = {
  get: (req, res) => {
    res.send("user logged out");
  }
};

module.exports = { home,signup, login, logout };
