const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");



router.post("/register",authMiddleware, adminMiddleware, (req, res) => register(req, res, "Directeur"));

module.exports = router; // ✅ Make sure you're exporting the router correctly
