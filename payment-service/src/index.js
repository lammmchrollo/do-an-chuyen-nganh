const express = require("express");
const app = express();
const paymentRoutes = require("./routes/payment.routes");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

app.use(cors());
app.use(express.json());
app.use("/api/payments", paymentRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Payment Service connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
});
