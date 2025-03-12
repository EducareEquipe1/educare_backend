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
  const activationLink = `http://localhost:3000/patients/activate/${token}`;

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

    if (patient.isActivated) {
      return res.status(400).json({ error: "Account already activated" });
    }

    await Patient.updatePatientActivation(email);
    res.status(200).json({ message: "Account activated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});
