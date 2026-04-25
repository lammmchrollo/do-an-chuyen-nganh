const Notification = require("../models/notification.model");

let ioInstance = null;

exports.setSocketInstance = (io) => {
  ioInstance = io;
};

exports.createNotification = async (req, res) => {
  try {
    const { orderId, message, status } = req.body;

    if (!orderId || !message) {
      return res.status(400).json({
        error: "orderId and message are required"
      });
    }

    const notification = new Notification({
      orderId,
      message,
      status
    });

    await notification.save();

    if (ioInstance) {
      ioInstance.emit("order-status-changed", {
        orderId,
        message,
        status,
        createdAt: notification.createdAt
      });
    }

    res.status(201).json({
      message: "Notification created",
      notification
    });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({
      error: "Cannot create notification"
    });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      error: "Cannot get notifications"
    });
  }
};

exports.getNotificationsByOrderId = async (req, res) => {
  try {
    const notifications = await Notification.find({
      orderId: req.params.orderId
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      error: "Cannot get notifications by orderId"
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found"
      });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({
      error: "Cannot mark notification as read"
    });
  }
};
