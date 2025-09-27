// Replace this file with the routes of your API

const express = require("express");
const dogRoutes = express.Router();
const requireAuth = require("../helpers/requireAuth");
const dogController = require("../controllers/dogController");

dogRoutes.get("/", dogController.renderDogList);
dogRoutes.get("/newdog", dogController.getNewDogForm);
dogRoutes.post("/newdog", requireAuth, dogController.createDog);
dogRoutes.get("/:id/adoptDogForm", requireAuth, dogController.getAdopt)
dogRoutes.post("/:id/adopt", requireAuth, dogController.adoptDog);
dogRoutes.get("/dogsIHaveAdopted", requireAuth, dogController.adoptedDogs)
dogRoutes.post("/:id/remove", requireAuth, dogController.removeDog)
dogRoutes.get("/mydogs", requireAuth, dogController.myDogs)
dogRoutes.get("/myRegisteredDogs", requireAuth, dogController.allMyRegisteredDogs)
dogRoutes.get("/myRegisteredDogs/adopted", requireAuth, dogController.allMyRegisteredDogs)
dogRoutes.get("/myRegisteredDogs/available", requireAuth, dogController.allMyRegisteredDogs)

module.exports = dogRoutes;