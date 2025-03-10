const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const db = require("../db"); // Adjusted path for the database connection

const Patient = require("../models/authPatientModel");

require("dotenv").config();

const JWT_SECRET = "your_super_secret_key";

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nabahat.imane@gmail.com",
    pass: "sqoy tuqa pcva krst",
  },
});

// ✅ Register Patient
exports.registerPatient = asyncHandler(async (req, res) => {
  const {
    email,
    last_name,
    first_name,
    password,
    birth_date,
    phone,
    matricule,
  } = req.body;

  if (
    !matricule ||
    !email ||
    !last_name ||
    !first_name ||
    !password ||
    !birth_date ||
    !phone
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const isValidEmail = (email) => {
    return validator.isEmail(email) && email.endsWith("@esi-sba.dz");
  };
  if (!isValidEmail) {
    res.status(400);
    throw new Error("Email should be in the right format name@esi-sba.dz");
  }

  const existingPatient = await Patient.findPatientByEmail(email);
  if (!db) {
    res.status(500);
    throw new Error("Database connection is not established.");
  }

  if (existingPatient) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newPatient = {
    email,
    last_name,
    first_name,
    password: hashedPassword,
    birth_date,
    phone,
    matricule,
    isActivated: false,
  };

  const result = await Patient.createPatient(newPatient);
  console.log(newPatient);

  const token = jwt.sign({ email: newPatient.email }, JWT_SECRET, {
    expiresIn: "24h",
  });
  const activationLink = `http://localhost:3000/patients/activate/${token}`;

  const mailOptions = {
    from: "nabahat.imane@gmail.com",
    to: newPatient.email,
    subject: "Email Verification",
    text: `Dear ${newPatient.first_name},\n\nPlease verify your account by clicking the link below:\n\n${activationLink}\n\nThis link will expire in 24 hours.\n\nBest regards,`,
  };

  await transporter.sendMail(mailOptions);

  res.status(201).json({
    message:
      "Patient registered successfully. Please check your email for activation.",
    patientId: result.patientId,
    matricule: result.matricule,
  });
});

// ✅ Activate Account
exports.activateAccount = asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email; // Extract email from token

    const patient = await Patient.findPatientByEmail(email);
    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    if (patient.isActivated) {
      res.status(400);
      throw new Error("Account already activated");
    }
    console.log(email);
    await Patient.updatePatientActivation(email); // Call the function directly from the model
    //we should redirect it to home
    //res.redirect("http://localhost:3000/home/");
    res
      .status(400)
      .json({ message: "the accounted is activated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// ✅ Login User
exports.loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const patient = await Patient.findPatientByEmail(email);
  if (!patient) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, patient.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!patient.is_active) {
    res.status(403);
    throw new Error("Account is not activated. Please check your email.");
  }

  const token = jwt.sign({ id: patient.patientId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: patient.patientId,
      email: patient.email,
      first_name: patient.first_name,
      last_name: patient.last_name,
    },
  });
});

exports.sendEmailVerification = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const patient = await Patient.findPatientByEmail(email);
  const token = jwt.sign({ email: req.body.email }, JWT_SECRET, {
    expiresIn: "24h",
  });
  const activationLink = `http://localhost:3000/patients/activate/${token}`;

  const mailOptions = {
    from: "nabahat.imane@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Dear ${patient.first_name},\n\nPlease verify your account by clicking the link below:\n\n${activationLink}\n\nThis link will expire in 24 hours.\n\nBest regards,`,
  };

  await transporter.sendMail(mailOptions);

  res.status(201).json({
    message: "email send successfully. Please check your email for activation.",
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const patient = await Patient.findPatientByEmail(email);

  if (!patient) {
    res.status(400);
    throw new Error("Patient not found");
  }

  // Call createResetPasswordToken from userModel.js

  const token = jwt.sign({ email: req.body.email }, JWT_SECRET, {
    expiresIn: "24h",
  });
  const activationLink = `http://localhost:3000/patients/reset-password/${token}`;

  const mailOptions = {
    from: "nabahat.imane@gmail.com",
    to: email,
    subject: "forget password EDUCARE",
    text: `Dear ${patient.first_name},\n\nPlease follow the link below to update your password:
${activationLink}

This link expires in 24 hours. If you didn’t request this, ignore this email.

Best regards,`,
  };

  await transporter.sendMail(mailOptions);
  //res.redirect("http://localhost:3000/changepassword/);
  res.status(201).json({
    message:
      "email send successfully. Please check your email for recupering your password.",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const newPassword = req.body.password;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email; // Extract email from token

    const patient = await Patient.findPatientByEmail(email);
    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    Patient.changeUserPassword({
      email,
      hashedPassword,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

exports.home = (req, res) => {
  res.status(200).json({ message: "Welcome to the home page!" });
};
