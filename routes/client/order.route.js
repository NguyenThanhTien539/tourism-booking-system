const route = require("express").Router();
const orderController = require("../../controllers/client/order.controller");

route.post("/create", orderController.createPost);

route.get("/success", orderController.success);

route.get("/payment-zalopay", orderController.paymentZaloPay);

route.post("/payment-zalopay-result", orderController.paymentZaloPayResultPost);

module.exports = route;
