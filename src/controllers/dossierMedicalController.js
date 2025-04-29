const DossierMedical = require("../models/dossierMedicalModel");
const { findUserByEmail } = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const db = require("../config/database");

exports.getUserMedicalInfo = async (req, res) => {
  const { email } = req.params;

  try {
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur not found" });
    }

    const utilisateur_id = utilisateur.id;

    // On cherche dans la table Patient
    const patientData = await db.query(
      "SELECT * FROM Patient WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (patientData.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = patientData[0];
    let statut = patient.categorie;

    // Vérifie si ce patient est aussi un directeur
    const directeurData = await db.query(
      "SELECT * FROM Directeur WHERE patient_id = ?",
      {
        replacements: [patient.id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (directeurData.length > 0) {
      statut = "Directeur";
    }
console.log(utilisateur_id);
    res.status(200).json({
      nom: patient.nom,
      prenom: patient.prenom,
      num_tel: patient.num_tel,
      date_naissance: patient.date_naissance,
      statut
    });

  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
    nom,
    prenom,
    num_tel,
    date_naissance,
    statut
  } = req.body;

  try {
    // 1. Trouver l'utilisateur
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur not found with this email" });
    }

    const utilisateur_id = utilisateur.id;

    // 2. Récupérer le patient
    const patientData = await db.query(
      "SELECT * FROM Patient WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (patientData.length === 0) {
      return res.status(404).json({ message: "Patient not found for this utilisateur" });
    }

    const patient = patientData[0];

    // 3. Vérifier si le patient est aussi un directeur
    const directeurData = await db.query(
      "SELECT * FROM Directeur WHERE patient_id = ?",
      {
        replacements: [patient.id],
        type: db.QueryTypes.SELECT,
      }
    );

    const statut = directeurData.length > 0 ? "directeur" : patient.categorie;

    // 4. Vérifier s'il existe déjà un dossier
    const [existingDossier] = await db.query(
      "SELECT * FROM Dossier_Medical WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (existingDossier) {
      return res.status(400).json({ message: "A medical record already exists for this user" });
    }

    // 5. Création du dossier médical
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
      utilisateur_id,
      nom,
      prenom,
      num_tel,
      date_naissance,
      statut
    });

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
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const utilisateur_id = utilisateur.id;

    const dossier = await DossierMedical.findOne({ where: { utilisateur_id } });

    if (!dossier) {
      return res.status(404).json({ message: "Dossier médical non trouvé pour cet utilisateur" });
    }

    res.status(200).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du dossier médical" });
  }
});


// UPDATE medical record
exports.updateMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // 1. Trouver l'utilisateur
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé avec cet email" });
    }

    const utilisateur_id = utilisateur.id;

    // 2. Trouver le dossier médical correspondant
    const dossier = await DossierMedical.findOne({ where: { utilisateur_id } });

    if (!dossier) {
      return res.status(404).json({ message: "Dossier médical non trouvé pour cet utilisateur" });
    }

    // 3. Mise à jour du dossier
    await dossier.update(req.body);

    res.status(200).json({
      message: "Dossier médical mis à jour avec succès",
      dossier
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
});

