const route = require("express").Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");

route.get("/", dashboardController.dashboard);

route.post("/revenue-chart", dashboardController.revenueChartPost);

module.exports = route;
