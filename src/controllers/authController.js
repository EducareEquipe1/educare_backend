const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/emailService");
const extractUsersFromText = require("../utils/pdfParser");
const validator = require("validator");
const BlacklistToken = require("../models/blacklistTokenModel");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";
//✅all page
//✅modification Directeur added
exports.bulkRegisterFromExcel = async (req, res, userType) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // as array of arrays

    const results = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const [
        first_name,
        last_name,
        email,
        password,
        birth_date,
        phone,
        matricule,
        categorie,
      ] = row.map((x) => (x ? x.toString().trim() : ""));

      if (
        !email ,
        !last_name ,
        !first_name ,
        !password ,
        !birth_date, 
        !phone ,
        !matricule, 
        !categorie
      ) {
        results.push({ email, status: "failed", error: "Missing fields" });
        continue;
      }

      const exists = await Patient.findUserByEmail(email);
      const archived = await Patient.findUserByEmailArchived(email);

      if (archived , exists) {
        results.push({
          email,
          status: "failed",
          error: "User already exists (main or archived)",
        });
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const newPatient = await Patient.createPatientVerified(
          {
            prenom: first_name,
            nom: last_name,
            email,
            password: hashedPassword,
            date_naissance: birth_date,
            num_tel: phone,
            matricule,
            categorie,
          },
          userType
        );

        results.push({
          email,
          status: "success",
          patientId: newPatient.patientId,
        });
      } catch (err) {
        results.push({ email, status: "failed", error: err.message });
      }
    }

    fs.unlinkSync(req.file.path); // delete temp file

    res.status(200).json({
      message: "📥 Bulk registration from Excel completed",
      results,
    });
  } catch (error) {
    res.status(500).json({ error: "❌ " + error.message });
  }
};
exports.register = asyncHandler(async (req, res, userType) => {
  const {
    first_name,
    last_name,
    email,
    password,
    birth_date,
    phone,
    matricule,
    categorie,
  } = req.body;

  // Use a mutable variable for categorie
  let finalCategorie = categorie;
  if (userType === "Directeur") {
    finalCategorie = "Directeur";
  }

  // Field validation
  if (
    !email ||
    !last_name ||
    !first_name ||
    !password ||
    !birth_date ||
    !phone ||
    !matricule ||
    (userType === "Patient" && !finalCategorie)
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email validation
  const isValidEmail = (email) => {
    return validator.isEmail(email) && email.endsWith("@esi-sba.dz");
  };

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Email should be in the right format name@esi-sba.dz" });
  }

  // Check if user exists in main and archived
  const existingPatient = await Patient.findUserByEmail(email);
  const existingPatientArchived = await Patient.findUserByEmailArchived(email);

  if (existingPatientArchived) {
    return res
      .status(400)
      .json({ error: "User already exists in archived records." });
  }

  if (existingPatient) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user and patient
  const newPatient = await Patient.createPatient(
    {
      prenom: first_name,
      nom: last_name,
      email,
      password: hashedPassword,
      date_naissance: birth_date,
      num_tel: phone,
      matricule,
      categorie: finalCategorie,
    },
    userType
  );

  // Create JWT token
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  const activationLink = `https://educare-backend-l6ue.onrender.com/patients/activate/${token}`;

  // Email message logic
  let message;
  if (userType === "Patient") {
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

  // Final response
  res.status(201).json({
    message: message,
    patientId: newPatient.patientId,
    matricule: newPatient.matricule,
  });
});

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
  const role = await Patient.getUserRoleByEmail(patient.email);
  console.log("this is my role", role);
  res.status(200).json({
    message: "Login successful",
    token,
    patient: {
      id: patient.id,
      email: patient.email,
      verified: patient.verified,
      role: role,
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
    categorie: patient.categorie,
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

exports.getPatientByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  try {
    const patient = await Patient.getUserProfile(email);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: patient.utilisateur_id,
        email: patient.email,
        firstName: patient.prenom,
        lastName: patient.nom,
        phone: patient.num_tel,
      },
    });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching patient data" });
  }
});
