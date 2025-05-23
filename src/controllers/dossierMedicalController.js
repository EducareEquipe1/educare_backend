const DossierMedical = require("../models/dossierMedicalModel");
const { findUserByEmail } = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const db = require("../config/database");


/**
 * GET - Récupérer les infos de base de l'utilisateur (nom, prenom, etc.)
 */
exports.getUserMedicalInfo = async (req, res) => {
  const { email } = req.params;

  try {
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const utilisateur_id = utilisateur.id;

    const patientData = await db.query(
      "SELECT * FROM Patient WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (patientData.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const patient = patientData[0];
    let statut = patient.categorie;

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

    res.status(200).json({
      nom: patient.nom,
      prenom: patient.prenom,
      num_tel: patient.num_tel,
      date_naissance: patient.date_naissance,
      statut
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des infos utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * POST - Créer un dossier médical vide avec les infos de base
 */
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

  // Fonction utilitaire pour convertir string "oui"/"non" ou "true"/"false" en booléen
  function toBool(value) {
    if (typeof value === "string") {
      const val = value.toLowerCase();
      if (val === "oui" || val === "true") return true;
      if (val === "non" || val === "false") return false;
    }
    return Boolean(value);
  }

  try {
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé avec cet email" });
    }

    const utilisateur_id = utilisateur.id;

    const patientData = await db.query(
      "SELECT * FROM Patient WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (patientData.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé pour cet utilisateur" });
    }

    const patient = patientData[0];

    const directeurData = await db.query(
      "SELECT * FROM Directeur WHERE patient_id = ?",
      {
        replacements: [patient.id],
        type: db.QueryTypes.SELECT,
      }
    );

    const statutFinal = directeurData.length > 0 ? "directeur" : patient.categorie;

    const [existingDossier] = await db.query(
      "SELECT * FROM Dossier_Medical WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (existingDossier) {
      return res.status(400).json({ message: "Un dossier médical existe déjà pour cet utilisateur" });
    }

    // Convertir les champs string oui/non en booléens
    const alcoolBool = toBool(alcool);
    const tabacFumeBool = toBool(tabac_fume);
    const ancienFumeBool = toBool(ancien_fume);
    const tabacChiqueBool = toBool(tabac_chique);
    const tabacPrisBool = toBool(tabac_pris);

    const newDossier = await DossierMedical.create({
      date_creation: new Date(),
      groupeSanguin,
      numSecuriteSociale,
      adresse,
      situation_famille,
      taille,
      poids,
      tabac_fume: tabacFumeBool,
      tabac_fume_nombre,
      tabac_chique: tabacChiqueBool,
      tabac_chique_nombre,
      tabac_pris: tabacPrisBool,
      tabac_pris_nombre,
      age_pris,
      ancien_fume: ancienFumeBool,
      periode_exposition,
      alcool: alcoolBool,
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
      statut: statutFinal
    });

    res.status(201).json({
      message: "Dossier médical créé avec succès (informations de base uniquement)",
      dossier: newDossier
    });
  } catch (error) {
    console.error("Erreur lors de la création du dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du dossier médical" });
  }
};


/**
 * GET - Récupérer un dossier médical complet par email
 */
exports.getMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  try {
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const utilisateur_id = utilisateur.id;

    const dossier = await DossierMedical.findOne({ where: { utilisateur_id } });

    if (!dossier) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    res.status(200).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du dossier médical" });
  }
});

/**
 * PUT - Mettre à jour un dossier médical (par le médecin)
 */
exports.updateMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  try {
    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const utilisateur_id = utilisateur.id;

    const dossier = await DossierMedical.findOne({ where: { utilisateur_id } });

    if (!dossier) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    await dossier.update(req.body);

    res.status(200).json({
      message: "Dossier médical mis à jour avec succès",
      dossier
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
