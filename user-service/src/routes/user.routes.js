const express = require("express");
const router = express.Router();
const { register, login, checkEmail } = require("../controllers/user.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/check/:email", checkEmail);

router.get("/", (req, res) => {
  res.json([{ id: 1, email: "demo@user.com" }]);
});

module.exports = router;
