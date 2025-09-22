// Replace this file with the routes of your API

const express = require("express");
const dogRoutes = express.Router();
const requireAuth = require("../helpers/requireAuth");
const dogController = require("../controllers/dogController");

dogRoutes.get("/", dogController.getDogs);
dogRoutes.get("/newdog", dogController.get);
dogRoutes.post("/newdog", requireAuth, dogController.createDog);

module.exports = dogRoutes;