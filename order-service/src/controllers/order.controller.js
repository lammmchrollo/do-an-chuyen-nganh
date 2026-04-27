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

const ORDER_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivering", "waiting_for_driver", "cancelled"],
  waiting_for_driver: ["delivering", "cancelled"],
  delivering: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function isValidTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  return ORDER_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
}

async function getProductById(productId) {
  const response = await axios.get(`http://restaurant-service:4002/api/restaurants/${productId}`);
  return response.data;
}

exports.createOrder = async (req, res) => {
  const { userEmail, items, deliveryAddress, deliveryFee } = req.body;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items is required" });
    }

    const check = await axios.get(`http://user-service:4001/api/users/check/${userEmail}`);
    if (!check.data.exists) {
      return res.status(400).json({ error: "User email does not exist!" });
    }

    const hydratedItems = await Promise.all(
      items.map(async (item) => {
        const qty = Number(item.quantity) || 0;
        if (!item.productId || qty < 1) {
          throw new Error("Invalid productId or quantity");
        }

        const product = await getProductById(item.productId);

        if (product.isAvailable === false) {
          throw new Error(`Product ${product._id} is unavailable`);
        }

        const total = product.price * qty;

        return {
          productId: product._id.toString(),
          productName: product.name,
          unitPrice: product.price,
          quantity: qty,
          total,
          restaurantId: product.restaurantId?._id?.toString() || product.restaurantId?.toString() || "",
        };
      })
    );

    const subtotal = hydratedItems.reduce((sum, item) => sum + item.total, 0);
    const restaurantIds = [...new Set(hydratedItems.map((item) => item.restaurantId))];

    if (restaurantIds.length > 1) {
      return res
        .status(400)
        .json({ error: "All items in one order must belong to the same restaurant" });
    }

    const normalizedDeliveryFee = Number(deliveryFee) >= 0 ? Number(deliveryFee) : 15000;
    const totalPrice = subtotal + normalizedDeliveryFee;

    const order = new Order({
      userEmail,
      restaurantId: restaurantIds[0] || "",
      items: hydratedItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.total,
      })),
      subtotal,
      deliveryFee: normalizedDeliveryFee,
      totalPrice,
      deliveryAddress,
      status: "pending",
      paymentStatus: "unpaid",
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
    res.status(500).json({ error: "Server error or unable to create order" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    const query = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Cannot get orders" });
  }
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

    if (!isValidTransition(order.status, status)) {
      return res.status(400).json({
        error: `Invalid transition from ${order.status} to ${status}`,
      });
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

exports.markPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowed = ["unpaid", "paid", "refunded"];

    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid paymentStatus" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Payment status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: "Cannot update payment status" });
  }
};
