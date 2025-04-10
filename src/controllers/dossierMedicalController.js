
const DossierMedical = require("../models/dossierMedicalModel");
const { findUserByEmail } = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const db = require("../config/database");

exports.createMedicalRecord = async (req, res) => {
  const {
    date_creation,
    groupeSanguin,
    numSecuriteSociale,
    adresse,
    situation_famille,
    taille,
    poids,
    tabac_fume,
    tabac_fume_nombre,
    tabac_chique,
    tabac_chique_nombre,
    tabac_pris,
    tabac_pris_nombre,
    age_pris,
    ancien_fume,
    periode_exposition,
    alcool,
    medicaments,
    affectionsCongenitales,
    maladiesGenerales,
    interventionsChirurgicales,
    reactionsAllergiques,
    notes,
    email,
  } = req.body;

  try {
    // Step 1: Find the user from the Utilisateur table based on email
    const utilisateur = await findUserByEmail(email);  // Using the function that finds a user by email

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur not found with this email" });
    }

    const utilisateur_id = utilisateur.id; // Get the utilisateur_id

    // Step 2: Check if the user exists in Patient, Medecin, or Directeur tables based on utilisateur_id
    let user = null;
    let statut = ''; // Initialize statut variable

    // Check Patient table
    const patientData = await db.query("SELECT * FROM Patient WHERE utilisateur_id = ?", {
      replacements: [utilisateur_id],
      type: db.QueryTypes.SELECT,
    });

    console.log(patientData);
    if (patientData.length > 0) {
      user = patientData[0];
      statut = user.categorie; // Set statut to patient's categorie
    }

    // If not found in Patient, check Directeur table
    if (!user) {
      const directeur = await db.query("SELECT * FROM Directeur WHERE utilisateur_id = ?", {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      });
      if (directeur.length > 0) {
        user = directeur[0];
        statut = 'directeur'; // Set statut to 'directeur' for Directeur user
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found in any relevant table" });
    }

    console.log(user);  // Check if user has nom, prenom, num_tel

    // Step 2.5: Check if a medical record already exists for this patient
    const existingRecord = await DossierMedical.findOne({ where: { email } });

    if (existingRecord) {
      return res.status(400).json({ message: "A medical record already exists for this patient" });
    }

    // Step 3: Create the Dossier_Medical record, including statut
    const newDossier = await DossierMedical.create({
      date_creation,
      groupeSanguin,
      numSecuriteSociale,
      adresse,
      situation_famille,
      taille,
      poids,
      tabac_fume,
      tabac_fume_nombre,
      tabac_chique,
      tabac_chique_nombre,
      tabac_pris,
      tabac_pris_nombre,
      age_pris,
      ancien_fume,
      periode_exposition,
      alcool,
      medicaments,
      affectionsCongenitales,
      maladiesGenerales,
      interventionsChirurgicales,
      reactionsAllergiques,
      notes,
      patient_id: user.id,
      email,
      nom: user.nom,  // Automatically fill the nom
      prenom: user.prenom,  // Automatically fill the prenom
      num_tel: user.num_tel,  // Automatically fill the num_tel
      date_naissance: user.date_naissance,
      statut,  // Include the statut field
    });

    console.log(newDossier);

    res.status(201).json({
      message: "Medical record created successfully",
      dossier: newDossier,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create medical record" });
  }
};

// GET endpoint to retrieve a medical record by email 
exports.getMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const dossier = await DossierMedical.findOne({ where: { email } });

    if


(!dossier) {
      return res.status(404).json({ message: "Medical record not found for this patient" });
    }

    res.status(200).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving medical record" });
  }
});

 
// PUT endpoint to update a medical record
exports.updateMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params; 

  try {
    const dossier = await DossierMedical.findOne({ where: { email } });

    if (!dossier) {
      return res.status(404).json({ message: "Medical record not found for this patient" });
    }

    // Update only the fields present in req.body
    await dossier.update(req.body);

    res.status(200).json({ message: "Medical record updated successfully", dossier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating medical record" });
  }
});