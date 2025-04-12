const DossierMedical = require("../models/dossierMedicalModel");
const { findUserByEmail } = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const db = require("../config/database");

// CREATE medical record
exports.createMedicalRecord = async (req, res) => {
  const { email } = req.params;

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
  } = req.body;

  try {
    // Step 1: Find the user from the Utilisateur table based on email
    console.log("Email received:", email);
    const utilisateur = await findUserByEmail(email);
    console.log("Utilisateur found:", utilisateur);

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur not found with this email" });
    }

    const utilisateur_id = utilisateur.id;
    const userEmail = utilisateur.email; 

    // Step 2: Check if the user exists in Patient or Directeur tables
    let user = null;
    let statut = "";

    const patientData = await db.query(
      "SELECT * FROM Patient WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (patientData.length > 0) {
      user = patientData[0];
      statut = user.categorie;
    }

    if (!user) {
      const directeurData = await db.query(
        "SELECT * FROM Directeur WHERE utilisateur_id = ?",
        {
          replacements: [utilisateur_id],
          type: db.QueryTypes.SELECT,
        }
      );

      if (directeurData.length > 0) {
        user = directeurData[0];
        statut = "directeur";
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found in any relevant table" });
    }

    // Step 2.5: Check if the user already has a linked dossierMedical_id
    const [patientWithRecord] = await db.query(
      "SELECT * FROM Patient WHERE utilisateur_id = ? AND dossierMedical_id IS NOT NULL",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    const [directeurWithRecord] = await db.query(
      "SELECT * FROM Directeur WHERE utilisateur_id = ? AND dossierMedical_id IS NOT NULL",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (patientWithRecord || directeurWithRecord) {
      return res.status(400).json({
        message: "A medical record already exists for this user (either as patient or directeur)",
      });
    }
 console.log(email);
    // Step 3: Create the medical record
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
      nom: user.nom,
      prenom: user.prenom,
      num_tel: user.num_tel,
      email: email,
      date_naissance: user.date_naissance,
      statut,
      
    });

    // Step 4: Update corresponding table to link the dossierMedical_id
    if (statut === "directeur") {
      await db.query(
        "UPDATE Directeur SET dossierMedical_id = ? WHERE utilisateur_id = ?",
        {
          replacements: [newDossier.id, utilisateur_id],
          type: db.QueryTypes.UPDATE,
        }
      );
    } else {
      await db.query(
        "UPDATE Patient SET dossierMedical_id = ? WHERE utilisateur_id = ?",
        {
          replacements: [newDossier.id, utilisateur_id],
          type: db.QueryTypes.UPDATE,
        }
      );
    }

    res.status(201).json(newDossier);
  } catch (error) {
    console.error("Error creating medical record:", error);
    res.status(500).json({ message: "Server error while creating medical record" });
  }
};

// GET medical record by email
exports.getMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const dossier = await DossierMedical.findOne({ where: { email } });

    if (!dossier) {
      return res.status(404).json({ message: "Medical record not found for this patient" });
    }

    res.status(200).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving medical record" });
  }
});

// UPDATE medical record
exports.updateMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  try {
    const dossier = await DossierMedical.findOne({ where: { email } });

    if (!dossier) {
      return res.status(404).json({ message: "Medical record not found for this patient" });
    }

    await dossier.update(req.body);

    res.status(200).json({ message: "Medical record updated successfully", dossier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating medical record" });
  }
});
