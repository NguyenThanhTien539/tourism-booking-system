const route = require("express").Router();
const tourController = require("../../controllers/client/tour.controller");

route.get("/detail/:slug", tourController.detail );

module.exports = route;
