const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");


exports.deleteUserByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params; // Get email from request parameters

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const user = await Patient.findUserByEmail(email); // Check if user exists
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const deleted = await Patient.deleteUserByEmail(email); // Delete user
  
    if (deleted) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete user" });
    }

});

exports.editMedecinStateByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params; // Get email from request parameters

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const user = await Patient.findUserByEmail(email); // Check if user exists
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const edited = await Patient.editMedecinStateByEmail(email); // edit medecin state
  
    if (edited) {
      res.json({ message: "User state edited successfully" });
    } else {
      res.status(500).json({ message: "Failed to edit user state" });
    }

});