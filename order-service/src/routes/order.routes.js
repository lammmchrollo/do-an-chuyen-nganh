const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");

router.post("/", controller.createOrder);
router.get("/", controller.getAllOrders);
router.get("/user/:email", controller.getOrdersByUser);
router.get("/:id", controller.getOrderById);
router.patch("/:id/status", controller.updateOrderStatus);
router.patch("/:id/dispatch", controller.dispatchOrder);
router.patch("/:id/payment-status", controller.markPaymentStatus);

module.exports = router;
