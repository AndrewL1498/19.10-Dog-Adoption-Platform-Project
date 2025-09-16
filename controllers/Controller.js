// Replace this file with the logic for handling incoming requests and returning responses to the client

// controllers/authController.js

const home = {
    get: (req, res) => {
        res.render("home");
    }
};

const signup = {
  get: (req, res) => {
    res.render("signup");
  },
  post: (req, res) => {
    res.send("new signup");
  }
};

const login = {
  get: (req, res) => {
    res.render("login");
  },
  post: (req, res) => {
    res.send("user logged in");
  }
};

const logout = {
  get: (req, res) => {
    res.render("user logged out");
  }
};

module.exports = { home,signup, login, logout };
