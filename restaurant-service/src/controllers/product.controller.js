const Product = require("../models/product.model");
const Restaurant = require("../models/restaurant.model");

exports.getAllProducts = async (req, res) => {
  try {
    const { q, restaurantId, includeUnavailable } = req.query;
    const query = {};

    if (includeUnavailable !== "true") {
      query.isAvailable = true;
    }

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate("restaurantId", "name address")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Cannot get menus" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "restaurantId",
      "name address"
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Cannot get menu item" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId is required" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Cannot create menu item" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Cannot update menu item" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Cannot delete menu item" });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const { q } = req.query;
    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { address: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const restaurants = await Restaurant.find(query).sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: "Cannot get restaurants" });
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: "Cannot create restaurant" });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Cannot update restaurant" });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    await Product.deleteMany({ restaurantId: req.params.id });
    res.json({ message: "Restaurant and menus deleted" });
  } catch (err) {
    res.status(500).json({ error: "Cannot delete restaurant" });
  }
};

exports.getMenusByRestaurant = async (req, res) => {
  try {
    const menus = await Product.find({ restaurantId: req.params.id }).sort({ createdAt: -1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: "Cannot get menus by restaurant" });
  }
};
