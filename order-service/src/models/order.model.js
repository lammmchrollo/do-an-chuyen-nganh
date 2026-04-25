const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: String,
  productId: String,
  quantity: Number,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
