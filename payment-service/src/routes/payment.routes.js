const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/payment.controller");

router.post("/", processPayment);

router.get("/", (req, res) => {
  res.json([{ status: "paid", orderId: "example123" }]);
});

module.exports = router;
