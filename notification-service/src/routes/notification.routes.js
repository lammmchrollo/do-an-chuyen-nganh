const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");

router.post("/", controller.createNotification);
router.get("/", controller.getAllNotifications);
router.get("/order/:orderId", controller.getNotificationsByOrderId);
router.patch("/:id/read", controller.markAsRead);

module.exports = router;
