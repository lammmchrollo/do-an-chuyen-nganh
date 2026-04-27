const express = require("express");
const router = express.Router();
const {
  processPayment,
  refundPayment,
  getAllPayments,
} = require("../controllers/payment.controller");

router.post("/", processPayment);
router.post("/refund", refundPayment);
router.get("/", getAllPayments);

module.exports = router;
