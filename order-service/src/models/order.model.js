const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: String,
  productId: String,
  quantity: Number,
  totalPrice: Number,
  deliveryAddress: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "waiting_for_driver", "delivering", "completed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid"
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
