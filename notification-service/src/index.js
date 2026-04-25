const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const notificationRoutes = require("./routes/notification.routes");
const notificationController = require("./controllers/notification.controller");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

notificationController.setSocketInstance(io);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Notification Service connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err));

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("connected", {
    message: "Connected to Notification Service"
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "Notification Service",
    status: "running"
  });
});

const PORT = process.env.PORT || 4006;

server.listen(PORT, () => {
  console.log(`Notification Service is running on port ${PORT}`);
});
