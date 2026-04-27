const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  restaurantId: { type: String, default: "" },
  items: {
    type: [orderItemSchema],
    default: [],
  },
  subtotal: { type: Number, required: true, default: 0 },
  deliveryFee: { type: Number, required: true, default: 15000 },
  totalPrice: { type: Number, required: true, default: 0 },
  deliveryAddress: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "waiting_for_driver", "delivering", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
