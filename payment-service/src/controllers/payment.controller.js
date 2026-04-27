const axios = require("axios");
const Payment = require("../models/payment.model");

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://order-service:4003";

async function syncOrderPaymentStatus(orderId, paymentStatus) {
  try {
    await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/payment-status`, {
      paymentStatus,
    });
  } catch (err) {
    console.error("Cannot sync payment status to order-service:", err.message);
  }
}

exports.processPayment = async (req, res) => {
  const { orderId, amount, method, forceStatus } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: "Missing orderId or amount" });
  }

  try {
    const status = forceStatus === "failed" ? "failed" : "paid";

    const payment = new Payment({
      orderId,
      amount,
      method: method || "cash",
      status,
      failureReason: status === "failed" ? "Simulated payment failure" : "",
    });

    await payment.save();

    await syncOrderPaymentStatus(orderId, status === "paid" ? "paid" : "unpaid");

    if (status === "failed") {
      return res.status(400).json({
        message: "Payment failed",
        payment,
      });
    }

    res.json({
      message: "Payment successful",
      payment,
    });
  } catch (err) {
    res.status(500).json({ error: "Cannot process payment" });
  }
};

exports.refundPayment = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }

  try {
    const payment = await Payment.findOne({ orderId, status: "paid" }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({ error: "No successful payment found" });
    }

    payment.status = "refunded";
    payment.refundedAt = new Date();
    await payment.save();

    await syncOrderPaymentStatus(orderId, "refunded");

    res.json({
      message: "Refund successful",
      payment,
    });
  } catch (err) {
    res.status(500).json({ error: "Cannot refund payment" });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Cannot get payments" });
  }
};
