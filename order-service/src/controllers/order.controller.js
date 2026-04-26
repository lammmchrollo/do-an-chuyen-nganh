const Order = require("../models/order.model");
const axios = require("axios");

const DELIVERY_SERVICE_URL =
  process.env.DELIVERY_SERVICE_URL || "http://delivery-service:4005";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:4006";

function inferAreaFromAddress(address) {
  if (!address) return "";

  const lower = address.toLowerCase();
  const match = lower.match(/quan\s*\d+|quận\s*\d+|q\.?\s*\d+/i);
  return match ? match[0] : "";
}

async function sendOrderNotification(orderId, status, message) {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      orderId,
      status,
      message,
    });
  } catch (err) {
    console.error("Cannot send order notification:", err.message);
  }
}

async function tryAssignDriver(order) {
  const preferredLocation = inferAreaFromAddress(order.deliveryAddress);

  try {
    const assignRes = await axios.post(`${DELIVERY_SERVICE_URL}/api/deliveries/assign`, {
      orderId: order._id.toString(),
      deliveryAddress: order.deliveryAddress || "Khong xac dinh",
      note: "Tu dong dieu phoi khi don san sang giao",
      preferredLocation,
    });

    return {
      success: true,
      data: assignRes.data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || err.message,
    };
  }
}

exports.createOrder = async (req, res) => {
  const { userEmail, productId, quantity, totalPrice, deliveryAddress } = req.body;

  try {
    const check = await axios.get(`http://user-service:4001/api/users/check/${userEmail}`);
    if (!check.data.exists) {
      return res.status(400).json({ error: "User email does not exist!" });
    }

    const order = new Order({
      userEmail,
      productId,
      quantity,
      totalPrice,
      deliveryAddress,
      status: "pending",
      paymentStatus: "paid",
    });
    await order.save();

    await sendOrderNotification(
      order._id,
      order.status,
      `Don hang ${order._id} da duoc tao va dang cho xac nhan`
    );

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ error: "Server error or unable to connect to user-service" });
  }
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
};

exports.getOrdersByUser = async (req, res) => {
  const email = req.params.email;
  const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "waiting_for_driver",
      "delivering",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let assignment = null;

    if (status === "ready") {
      assignment = await tryAssignDriver(order);

      if (assignment.success) {
        order.status = "delivering";
      } else {
        order.status = "waiting_for_driver";
      }
    } else {
      order.status = status;
    }

    await order.save();

    await sendOrderNotification(
      order._id,
      order.status,
      `Trang thai don ${order._id} da chuyen sang ${order.status}`
    );

    res.json({
      message: "Order status updated",
      order,
      assignment,
    });
  } catch (err) {
    console.error("Update order status error:", err.message);
    res.status(500).json({ error: "Cannot update order status" });
  }
};

exports.dispatchOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!["ready", "waiting_for_driver"].includes(order.status)) {
      return res.status(400).json({
        error: "Order must be in ready or waiting_for_driver state to dispatch",
      });
    }

    const assignment = await tryAssignDriver(order);

    if (assignment.success) {
      order.status = "delivering";
    } else {
      order.status = "waiting_for_driver";
    }

    await order.save();

    await sendOrderNotification(
      order._id,
      order.status,
      assignment.success
        ? `Don ${order._id} da duoc gan tai xe`
        : `Don ${order._id} dang cho tai xe, he thong se thu lai`
    );

    res.json({
      message: assignment.success ? "Dispatch successful" : "Dispatch pending",
      order,
      assignment,
    });
  } catch (err) {
    console.error("Dispatch order error:", err.message);
    res.status(500).json({ error: "Cannot dispatch order" });
  }
};
