const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");


router.post("/register",verifyToken, authorizeRoles("admin") ,
(req, res) => register(req, res, "Medecin"));

module.exports = router; // ✅ Make sure you're exporting the router correctly
