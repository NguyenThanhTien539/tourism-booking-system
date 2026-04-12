const route = require("express").Router();
const homeRoute = require("./home.route");
const tourRoute = require("./tour.route");
const cartRoute = require("./cart.route");
const contactRoute = require("./contact.route");
const categoryRoute = require("./category.route");
const searchRoute = require("./search.route");
const orderRoute = require("./order.route");

const settingMiddleware = require("../../middlewares/client/setting.middleware");
const categoryMiddleware = require("../../middlewares/client/category.middleware");

route.use(settingMiddleware.websiteInfo);
route.use(categoryMiddleware.list);

route.use("/", homeRoute);
route.use("/tour", tourRoute);
route.use("/cart", cartRoute);
route.use("/contact", contactRoute);
route.use("/category", categoryRoute);
route.use("/search", searchRoute);
route.use("/order", orderRoute);

module.exports = route;
