const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/product.routes");
const cors = require("cors");
const Product = require("./models/product.model");
const Restaurant = require("./models/restaurant.model");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB successfully");

    const restaurantSeedData = [
      {
        name: "Com Nha Lua",
        description: "Com phan va mon Viet truyen thong",
        address: "123 Nguyen Trai, Quan 5",
        phone: "0909111222",
      },
      {
        name: "Pho 24h",
        description: "Pho bo, pho ga, mon nuoc nong hoi",
        address: "89 Cach Mang Thang 8, Quan 3",
        phone: "0909333444",
      },
      {
        name: "Tra Sua Pho Co",
        description: "Do uong va an vat giao nhanh",
        address: "58 Le Van Sy, Quan Phu Nhuan",
        phone: "0909555666",
      },
    ];

    const restaurantCount = await Restaurant.estimatedDocumentCount();
    if (restaurantCount === 0) {
      const createdRestaurants = await Restaurant.insertMany(restaurantSeedData);

      const menuSeedData = [
        {
          restaurantId: createdRestaurants[0]._id,
          name: "Com ga xoi mo",
          description: "Com ga gion, dua chua, nuoc mam toi ot",
          price: 55000,
          category: "Com",
        },
        {
          restaurantId: createdRestaurants[0]._id,
          name: "Ga ran sot cay",
          description: "2 mieng ga ran, sot cay Han Quoc",
          price: 79000,
          category: "Do an nhanh",
        },
        {
          restaurantId: createdRestaurants[1]._id,
          name: "Pho bo tai",
          description: "Pho bo tai mem, hanh, rau thom",
          price: 65000,
          category: "Pho",
        },
        {
          restaurantId: createdRestaurants[1]._id,
          name: "Bun bo Hue",
          description: "Nuoc dung dam vi, bo bap, gio heo, cha",
          price: 60000,
          category: "Bun",
        },
        {
          restaurantId: createdRestaurants[2]._id,
          name: "Tra sua tran chau",
          description: "Tra sua beo nhe, tran chau den dai gion",
          price: 35000,
          category: "Do uong",
        },
      ];

      await Product.deleteMany({});
      await Product.insertMany(menuSeedData);
      console.log("✅ Seeded restaurants and menu items");
    }
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.use("/api/restaurants", productRoutes);

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Restaurant Service is running on port ${PORT}`);
});
