const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/emailService");
const validator = require("validator");

const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// ✅ Register Patient
exports.register = asyncHandler(async (req, res, userType) => {
  const {
    first_name,
    last_name,
    email,
    password,
    birth_date,
    phone,
    matricule,
  } = req.body;
  if (
    !email ||
    !last_name ||
    !first_name ||
    !password ||
    !birth_date ||
    !phone ||
    !matricule
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const isValidEmail = (email) => {
    return validator.isEmail(email) && email.endsWith("@esi-sba.dz");
  };
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Email should be in the right format name@esi-sba.dz" });
  }
  const existingPatient = await Patient.findUserByEmail(email);
  console.log("existing patinet is", existingPatient);
  const existingPatientArchived = await Patient.findUserByEmailArchived(email);
  console.log(
    "existing patient that are archived are",
    existingPatientArchived
  );
  if (existingPatientArchived) {
    return res.status(400).json({ error: "User already exists " });
  }
  if (existingPatient) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newPatient = await Patient.createPatient(
    {
      prenom: first_name,
      nom: last_name,
      email,
      password: hashedPassword,
      date_naissance: birth_date,
      num_tel: phone,
      matricule,
    },
    userType
  );
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  const activationLink = `https://educare-backend-l6ue.onrender.com/patients/activate/${token}`;
  let message;
  if (userType == "Patient") {
    await sendEmail(
      email,
      "Email Verification",
      `Dear ${first_name},\n\nPlease verify your account by clicking the link below:\n\n${activationLink}\n\nBest regards,`
    );
    message =
      "User registered successfully. Please check your email for activation.";
  } else {
    message = "User registered successfully.";
  }

  res.status(201).json({
    message: message,
    patientId: newPatient.patientId,
    matricule: newPatient.matricule,
  });
});

// ✅ Login Patient
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const isValidEmail = (email) => {
    return validator.isEmail(email) && email.endsWith("@esi-sba.dz");
  };
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Email should be in the right format name@esi-sba.dz" });
  }
  const patient = await Patient.findUserByEmail(email);
  const patientArchived = await Patient.findUserByEmailArchived(email);
  if (patientArchived) {
    return res.status(401).json({ error: "User is archived " });
  }
  if (!patient) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, patient.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: patient.id, email: patient.email }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.status(200).json({
    message: "Login successful",
    token,
    patient: {
      id: patient.id,
      email: patient.email,
      verified: patient.verified,
    },
  });
});

exports.getActivePatients = async (req, res) => {
  try {
    const activePatients = await Patient.getActivePatients();
    res.json(activePatients);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// ✅ Get Current Patient Info
exports.getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.user.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  res.status(200).json({
    id: patient.id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    email: patient.email,
  });
});


