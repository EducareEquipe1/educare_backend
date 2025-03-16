const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");
const asyncHandler = require("../middlewares/asyncHandler");
const Patient = require("../models/authPatientModel");

const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// ✅ Forgot Password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
   const isValidEmail = (email) => {
      return validator.isEmail(email) && email.endsWith("@esi-sba.dz");
    };
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Email should be in the right format name@esi-sba.dz" });
    }
  const patient = await Patient.findUserByEmail(email);

  if (!patient) {
    return res.status(400).json({ error: "Patient not found" });
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  const resetLink = `http://localhost:5173/resetPassword/${token}`;
  console.log(patient);
  await sendEmail(
    email,
    "Reset Password Request",
    `Dear ${patient.first_name},\n\nPlease reset your password using the link below:\n\n${resetLink}\n\nThis link expires in 24 hours.\n\nBest regards.`
  );

  res.status(200).json({ message: "Password reset email sent successfully." });
});

// ✅ Set New Password (POST method)
exports.setNewPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;
    const patient = await Patient.findUserByEmail(email);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Patient.changeUserPassword({ email, hashedPassword });
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});
