const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/emailService");
const validator = require("validator");
const BlacklistToken = require("../models/blacklistTokenModel");

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
    categorie,  // Add category to the destructured fields
  } = req.body;

  if (
    !email ||
    !last_name ||
    !first_name ||
    !password ||
    !birth_date ||
    !phone ||
    !matricule ||
    (userType === "Patient" && !categorie)  // Check if category is required for Patient
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
  const existingPatientArchived = await Patient.findUserByEmailArchived(email);

  if (existingPatientArchived) {
    return res.status(400).json({ error: "User already exists in archived records." });
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
      categorie,  // Include the category when creating the patient
    },
    userType
  );

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  const activationLink = `https://educare-backend-l6ue.onrender.com/patients/activate/${token}`;

  let message;
  if (userType === "Patient") {
    await sendEmail(
      email,
      "Email Verification",
      `Dear ${first_name},\n\nPlease verify your account by clicking the link below:\n\n${activationLink}\n\nBest regards,`
    );
    message = "User registered successfully. Please check your email for activation.";
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

exports.logout = asyncHandler(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(400).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "Token manquant" });
    }

    // Decode the token to get expiry
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ error: "Token invalide" });
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await BlacklistToken.add(token, expiresAt);

    res.status(200).json({ message: "Déconnecté avec succès" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Erreur lors de la déconnexion" });
  }
});
