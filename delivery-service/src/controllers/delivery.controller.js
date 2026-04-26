const axios = require("axios");
const Driver = require("../models/driver.model");
const Delivery = require("../models/delivery.model");

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:4006";

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function sendNotification(orderId, message, status) {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      orderId,
      message,
      status
    });
  } catch (err) {
    console.error("Cannot send notification:", err.message);
  }
}

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: "Cannot get drivers" });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ error: "Cannot create driver" });
  }
};

exports.updateDriverStatus = async (req, res) => {
  try {
    const { status, currentLocation } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        status,
        currentLocation
      },
      {
        new: true
      }
    );

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: "Cannot update driver status" });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { orderId, deliveryAddress, note, preferredLocation } = req.body;

    if (!orderId || !deliveryAddress) {
      return res.status(400).json({
        error: "orderId and deliveryAddress are required"
      });
    }

    const existingDelivery = await Delivery.findOne({
      orderId,
      status: { $ne: "cancelled" }
    }).populate("driverId");

    if (existingDelivery) {
      return res.status(400).json({
        error: "Delivery already assigned for this order",
        delivery: existingDelivery
      });
    }

    const availableDrivers = await Driver.find({ status: "available" });

    if (availableDrivers.length === 0) {
      await sendNotification(
        orderId,
        `Don hang ${orderId} dang cho tai xe vi hien tai khong co tai xe ranh`,
        "waiting_for_driver"
      );

      return res.status(400).json({
        error: "No available driver"
      });
    }

    const preferred = normalizeText(preferredLocation || deliveryAddress);

    let candidateDrivers = availableDrivers;
    if (preferred) {
      const matched = availableDrivers.filter((driver) =>
        normalizeText(driver.currentLocation).includes(preferred)
      );

      if (matched.length > 0) {
        candidateDrivers = matched;
      }
    }

    const randomIndex = Math.floor(Math.random() * candidateDrivers.length);
    const selectedDriver = candidateDrivers[randomIndex];

    selectedDriver.status = "busy";
    await selectedDriver.save();

    const delivery = new Delivery({
      orderId,
      driverId: selectedDriver._id,
      deliveryAddress,
      note,
      status: "assigned"
    });

    await delivery.save();

    await sendNotification(
      orderId,
      `Đơn hàng ${orderId} đã được gán cho tài xế ${selectedDriver.name}`,
      "assigned"
    );

    res.status(201).json({
      message: "Driver assigned successfully",
      delivery,
      driver: selectedDriver
    });
  } catch (err) {
    console.error("Assign driver error:", err);
    res.status(500).json({ error: "Cannot assign driver" });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate("driverId");
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: "Cannot get deliveries" });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("driverId");

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: "Cannot get delivery" });
  }
};

exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      orderId: req.params.orderId
    }).populate("driverId");

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: "Cannot get delivery by orderId" });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("driverId");

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    if ((status === "delivered" || status === "cancelled") && delivery.driverId) {
      await Driver.findByIdAndUpdate(delivery.driverId._id, {
        status: "available"
      });
    }

    await sendNotification(
      delivery.orderId,
      `Trạng thái giao hàng của đơn ${delivery.orderId} đã chuyển sang: ${status}`,
      status
    );

    res.json({
      message: "Delivery status updated",
      delivery
    });
  } catch (err) {
    console.error("Update delivery status error:", err);
    res.status(500).json({ error: "Cannot update delivery status" });
  }
};
