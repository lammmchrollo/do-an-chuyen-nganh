const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver"
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: [
        "assigned",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled"
      ],
      default: "assigned"
    },
    note: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Delivery", deliverySchema);
