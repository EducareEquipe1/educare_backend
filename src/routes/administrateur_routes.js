const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

// Example route
router.post("/register",(req, res) => register(req, res, "Admin"));

module.exports = router; // ✅ Make sure you're exporting the router correctly
