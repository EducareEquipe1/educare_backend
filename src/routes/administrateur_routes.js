const express = require("express");
const { register, login } = require("../controllers/authController");

// ✅ Import from the correct controller file
const {
  getAllMedecins,
  getActivePatients,
  getAllPatients,
} = require("../controllers/getUsersController"); // Change this path to match your project structure

const router = express.Router();
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const { deleteUserByEmail , editMedecinStateByEmail } = require("../controllers/editUsersController");


router.post("/register", (req, res) => register(req, res, "Admin"));
router.get("/get-active-patients", authMiddleware, adminMiddleware, getActivePatients);
router.get("/get-all-patients", authMiddleware, adminMiddleware, getAllPatients);
router.get("/get-all-medecins", authMiddleware, adminMiddleware, getAllMedecins);
router.delete("/delete-user/:email", authMiddleware, adminMiddleware, deleteUserByEmail);
router.put("/edit-medecin-state/:email", authMiddleware, adminMiddleware, editMedecinStateByEmail);






module.exports = router; // ✅ Make sure you're exporting the router correctly
