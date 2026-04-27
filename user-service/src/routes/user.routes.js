const express = require("express");
const router = express.Router();
const {
  register,
  login,
  checkEmail,
  getProfile,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/check/:email", checkEmail);
router.get("/me", authMiddleware, getProfile);

router.get("/", (req, res) => {
  res.json([{ id: 1, email: "demo@user.com" }]);
});

module.exports = router;
