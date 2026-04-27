const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "card", "wallet"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["paid", "failed", "refunded"],
      default: "paid",
    },
    failureReason: { type: String, default: "" },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
