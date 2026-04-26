const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/product.routes");
const cors = require("cors");
const Product = require("./models/product.model");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB successfully");

    const foodSeedData = [
      {
        name: "Com ga xoi mo",
        description: "Com ga gion, dua chua, nuoc mam toi ot",
        price: 55000,
        category: "Com"
      },
      {
        name: "Bun bo Hue",
        description: "Nuoc dung dam vi, bo bap, gio heo, cha",
        price: 60000,
        category: "Bun"
      },
      {
        name: "Pho bo tai",
        description: "Pho bo tai mem, hanh, rau thom",
        price: 65000,
        category: "Pho"
      },
      {
        name: "Tra sua tran chau",
        description: "Tra sua beo nhe, tran chau den dai gion",
        price: 35000,
        category: "Do uong"
      },
      {
        name: "Ga ran sot cay",
        description: "2 mieng ga ran, sot cay Han Quoc",
        price: 79000,
        category: "Do an nhanh"
      }
    ];

    const count = await Product.estimatedDocumentCount();
    if (count === 0) {
      await Product.insertMany(foodSeedData);
      console.log("✅ Seeded food delivery menu items into MongoDB");
    } else {
      const legacyData = await Product.findOne({
        category: { $in: ["Web", "Mobile", "Design", "Backend", "Infrastructure"] }
      });

      if (legacyData) {
        await Product.deleteMany({});
        await Product.insertMany(foodSeedData);
        console.log("✅ Replaced legacy sample services with food delivery menu items");
      }
    }
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.use("/api/restaurants", productRoutes);

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Restaurant Service is running on port ${PORT}`);
});
