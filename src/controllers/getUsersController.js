const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");


exports.getActivePatients = asyncHandler(async (req, res) => {
  const activePatients = await Patient.getActivePatients();
  res.json(activePatients);
});

exports.getAllPatients = asyncHandler(async (req, res) => {
  const allPatients = await Patient.getAllPatients();
  res.json(allPatients);
});

exports.getAllMedecins = asyncHandler(async (req, res) => {
  const allMedecins = await Patient.getAllMedecins();
  res.json(allMedecins);
});

exports.getUtilisateurs = async (req, res) => {
  try {
    // Fetch archived utilisateurs from the model
    const result = await Patient.getUtilisateurs();

    // Respond with the list of archived utilisateurs
    res.status(200).json({ utilisateurs: result });
    console.log("utilisateurs:", result);
  } catch (error) {
    console.error("❌ Error fetching archived utilisateurs:", error);
    res.status(500).json({ error: error.toString() });
  }
};

