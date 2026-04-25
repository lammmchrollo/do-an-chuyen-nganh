const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const deliveryRoutes = require("./routes/delivery.routes");
const Driver = require("./models/driver.model");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Delivery Service connected to MongoDB");

    const count = await Driver.estimatedDocumentCount();

    if (count === 0) {
      await Driver.insertMany([
        {
          name: "Nguyễn Văn A",
          phone: "0901000001",
          status: "available",
          currentLocation: "Quận 1"
        },
        {
          name: "Trần Văn B",
          phone: "0901000002",
          status: "available",
          currentLocation: "Quận 3"
        },
        {
          name: "Lê Văn C",
          phone: "0901000003",
          status: "available",
          currentLocation: "Quận 5"
        }
      ]);

      console.log("Seeded sample drivers");
    }
  })
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/deliveries", deliveryRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "Delivery Service",
    status: "running"
  });
});

const PORT = process.env.PORT || 4005;

app.listen(PORT, () => {
  console.log(`Delivery Service is running on port ${PORT}`);
});
