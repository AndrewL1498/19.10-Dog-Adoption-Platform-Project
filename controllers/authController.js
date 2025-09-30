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
      return next(new ExpressError("Username and password are required", 400));
    }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return next(new ExpressError("Username already exists", 409));
      }

      const newUser = new User({ username, password });
      await newUser.save();
      res.status(201).json({message: "User registered successfully"});
     
    } catch (error) {

      if (error.name === 'ValidationError') {
        return next(new ExpressError(error.message, 400));
      }

      console.error("Error in signup:", error);
       next(error);
    }
  }
};

const login = {
  get: (req, res) => {
    res.render("login");
  },
  post: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      const userPassword = await user.isValidPassword(password);

      if (!user || !userPassword) {
        return next(new ExpressError("Invalid username or password", 401));
      }

      const token = generateToken(user);
      attachTokenToCookie(res, token);

      res.status(200).json({ message: "Login successful" });

   } catch (error) {
      console.error("Error in login:", error);
      next(error);
   }
  }
};

const logout = {
  get: (req, res) => {
    res.send("user logged out");
  }
};

module.exports = { home, signup, login, logout };
