const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");

const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// ✅ Register Patient
exports.register = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    matricule,
    birth_date,
    phone,
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
  if (existingPatient) {
    res.status(400);
    throw new Error("Patient already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newPatient = await Patient.createPatient({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    matricule,
    birth_date,
    phone,
  });
  console.log(newPatient);
  res.status(201).json({
    message:
      "Patient registered successfully. Please check your email for activation.",
    patientId: newPatient.patientId,
    matricule: newPatient.matricule,
  });
});

// ✅ Login Patient
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const patient = await Patient.findPatientByEmail(email);
  if (!patient) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, patient.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ id: patient.id, email: patient.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "Login successful",
    token,
    patient: {
      id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
    },
  });
});

// ✅ Get Current Patient Info
exports.getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.user.id);
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  res.status(200).json({
    id: patient.id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    email: patient.email,
  });
});
