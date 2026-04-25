const express = require("express");
const app = express();
const paymentRoutes = require("./routes/payment.routes");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
});
