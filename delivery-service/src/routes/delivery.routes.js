const express = require("express");
const router = express.Router();
const controller = require("../controllers/delivery.controller");

router.get("/drivers", controller.getAllDrivers);
router.post("/drivers", controller.createDriver);
router.patch("/drivers/:id/status", controller.updateDriverStatus);

router.post("/assign", controller.assignDriver);
router.get("/", controller.getAllDeliveries);
router.get("/order/:orderId", controller.getDeliveryByOrderId);
router.get("/:id", controller.getDeliveryById);
router.patch("/:id/status", controller.updateDeliveryStatus);

module.exports = router;
