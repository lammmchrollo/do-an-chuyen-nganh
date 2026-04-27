const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");

router.get("/restaurants", controller.getAllRestaurants);
router.post("/restaurants", controller.createRestaurant);
router.put("/restaurants/:id", controller.updateRestaurant);
router.delete("/restaurants/:id", controller.deleteRestaurant);
router.get("/restaurants/:id/menus", controller.getMenusByRestaurant);

router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductById);
router.post("/", controller.createProduct);
router.put("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

module.exports = router;
