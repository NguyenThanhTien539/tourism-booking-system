const route = require("express").Router();
const orderController = require("../../controllers/client/order.controller");
const orderValidate = require("../../validates/client/order.validate");

route.post("/create", orderValidate.createPost, orderController.createPost);

route.get("/success", orderController.success);

route.get("/payment-zalopay", orderController.paymentZaloPay);

route.post("/payment-zalopay-result", orderController.paymentZaloPayResultPost);

route.get("/payment-vnpay", orderController.paymentVNPay);

route.get("/payment-vnpay-result", orderController.paymentVNPayResult);

module.exports = route;
