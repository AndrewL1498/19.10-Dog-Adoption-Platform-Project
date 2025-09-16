// Replace this file with the routes of your API

const express = require("express");
const router = express.Router();
const { home, signup, login, logout } = require("../controllers/Controller");

router.get("/", home.get);
router.get("/signup", signup.get);
router.post("/signup", signup.post);
router.get("/login", login.get);
router.post("/login", login.post);
router.get("/logout", logout.get);

router.get("/test", (req, res) => {
  res.send("test route works");
});

module.exports = router;