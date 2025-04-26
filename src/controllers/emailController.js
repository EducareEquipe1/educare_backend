const jwt = require("jsonwebtoken");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/emailService");
const Patient = require("../models/authPatientModel");
require("dotenv").config();

const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// ✅ Send Email Verification
exports.sendEmailVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const patient = await Patient.findUserByEmail(email);

  if (!patient) {
    return res.status(400).json({ error: "Patient not found" });
  }

  if (patient.is_active == true) {
    return res.status(400).json({ error: "the account is already activated" });
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  const activationLink = `https://educare-backend-l6ue.onrender.com/patients/activate/${token}`;

  await sendEmail(
    email,
    "Email Verification",
    `Dear ${patient.first_name},\n\nPlease verify your account by clicking the link below:\n\n ${activationLink}\n\nBest regards,`
  );

  res
    .status(201)
    .json({ message: "Email sent successfully. Please check your inbox." });
});

// ✅ Activate Account
exports.activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  try {
    const { email } = jwt.verify(token, JWT_SECRET);
    const patient = await Patient.findUserByEmail(email);

    if (!patient) {
      return res.status(400).json({ error: "Patient not found" });
    }

    if (patient.verified) {
      return res.status(400).json({ error: "Account already verified" });
    }

    await Patient.updatePatientActivation(email);
    res.status(200).json({ message: "Account verified successfully" });
    res.redirect("http://localhost:5173/");
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

exports.checkVerificationStatus = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log("Checking verification status for email:", email);

  try {
    const patient = await Patient.findUserByEmail(email);
    console.log("Found patient:", JSON.stringify(patient, null, 2));

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // More explicit verification check, handling different possible values
    const isVerified =
      patient.is_active === 1 ||
      patient.is_active === true ||
      patient.verified === 1 ||
      patient.verified === true;

    console.log("Raw is_active value:", patient.is_active);
    console.log("Raw verified value:", patient.verified);
    console.log("Calculated verification status:", isVerified);

    return res.status(200).json({
      success: true,
      verified: isVerified,
      userData: {
        id: patient.id,
        email: patient.email,
        nom: patient.nom,
        prenom: patient.prenom,
        matricule: patient.matricule,
        categorie: patient.categorie,
      },
    });
  } catch (error) {
    console.error("Error checking verification:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error checking verification status",
    });
  }
});
