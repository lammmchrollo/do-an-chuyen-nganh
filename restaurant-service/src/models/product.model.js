const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  name: { type: String, required: true },
  price: Number,
  description: String,
  category: String,
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
