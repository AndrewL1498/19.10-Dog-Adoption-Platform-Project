// Replace this file with the routes of your API

const express = require("express");
const dogRoutes = express.Router();
const requireAuth = require("../helpers/requireAuth");
const dogController = require("../controllers/dogController");

dogRoutes.get("/", dogController.renderDogList);
dogRoutes.get("/newdog", dogController.getNewDogForm);
dogRoutes.post("/newdog", requireAuth, dogController.createDog);
dogRoutes.post("/:id/adopt", requireAuth, dogController.adoptDog);

module.exports = dogRoutes;