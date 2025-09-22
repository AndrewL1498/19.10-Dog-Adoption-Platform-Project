// Replace this file with the routes of your API

const express = require("express");
const authRoutes = express.Router();
const { home, signup, login, logout } = require("../controllers/authController");

authRoutes.get("/", home.get);
authRoutes.get("/signup", signup.get);
authRoutes.post("/signup", signup.post);
authRoutes.get("/login", login.get);
authRoutes.post("/login", login.post);
authRoutes.get("/logout", logout.get);

authRoutes.get("/test", (req, res) => {
  res.send("test route works");
});

module.exports = authRoutes;