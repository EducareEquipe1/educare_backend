const DossierMedical = require("../models/dossierMedicalModel");
const { findUserByEmail } = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");
const db = require("../config/database");

/**
 * Utilitaire : Convertit "oui"/"non" ou "true"/"false" en booléen
 */
function toBool(value) {
  if (typeof value === "string") {
    const val = value.toLowerCase();
    if (val === "oui" || val === "true") return true;
    if (val === "non" || val === "false") return false;
  }
  return Boolean(value);
}

/**
 * Utilitaire : Convertit une valeur en nombre ou renvoie null si invalide
 */
function number(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

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
      statut,
      email: utilisateur.email,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


 // POST - Créer un dossier médical vide avec les infos de base
 
exports.createMedicalRecord = async (req, res) => {
  const { email } = req.params;
  const {
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
    statut,
  } = req.body;

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

    const statutFinal = directeurData.length > 0 ? "Directeur" : patient.categorie;

    const existingDossier = await db.query(
      "SELECT * FROM Dossier_Medical WHERE utilisateur_id = ?",
      {
        replacements: [utilisateur_id],
        type: db.QueryTypes.SELECT,
      }
    );

    if (existingDossier.length > 0) {
      return res.status(400).json({ message: "Un dossier médical existe déjà pour cet utilisateur" });
    }

    const newDossier = await DossierMedical.create({
      date_creation: new Date(),
      groupeSanguin,
      numSecuriteSociale,
      adresse,
      situation_famille,
      taille: number(taille),
      poids: number(poids),
      tabac_fume: toBool(tabac_fume),
      tabac_fume_nombre: number(tabac_fume_nombre),
      tabac_chique: toBool(tabac_chique),
      tabac_chique_nombre: number(tabac_chique_nombre),
      tabac_pris: toBool(tabac_pris),
      tabac_pris_nombre: number(tabac_pris_nombre),
      age_pris: number(age_pris),
      ancien_fume: toBool(ancien_fume),
      periode_exposition,
      alcool: toBool(alcool),
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
      statut: statutFinal,
    });

    res.status(201).json({
      message: "Dossier médical créé avec succès (informations de base uniquement)",
      dossier: newDossier,
    });
  } catch (error) {
    console.error("Erreur création dossier médical:", error);
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
});


// PUT - Mettre à jour un dossier médical
 
exports.updateMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  const utilisateur = await findUserByEmail(email);
  if (!utilisateur) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  const utilisateur_id = utilisateur.id;

  const dossier = await DossierMedical.findOne({ where: { utilisateur_id } });
  if (!dossier) {
    return res.status(404).json({ message: "Dossier médical non trouvé" });
  }

  const input = req.body;
  const updatedFields = {};

  // Conversions conditionnelles : appliquer les utils seulement si les champs existent
  if ("taille" in input) updatedFields.taille = number(input.taille);
  if ("poids" in input) updatedFields.poids = number(input.poids);

  if ("tabac_fume" in input) updatedFields.tabac_fume = toBool(input.tabac_fume);
  if ("tabac_fume_nombre" in input) updatedFields.tabac_fume_nombre = number(input.tabac_fume_nombre);

  if ("tabac_chique" in input) updatedFields.tabac_chique = toBool(input.tabac_chique);
  if ("tabac_chique_nombre" in input) updatedFields.tabac_chique_nombre = number(input.tabac_chique_nombre);

  if ("tabac_pris" in input) updatedFields.tabac_pris = toBool(input.tabac_pris);
  if ("tabac_pris_nombre" in input) updatedFields.tabac_pris_nombre = number(input.tabac_pris_nombre);

  if ("age_pris" in input) updatedFields.age_pris = number(input.age_pris);
  if ("ancien_fume" in input) updatedFields.ancien_fume = toBool(input.ancien_fume);
  if ("alcool" in input) updatedFields.alcool = toBool(input.alcool);

  // Champs texte/dates/strings : copier tel quel s’ils existent
  const otherFields = [
    "groupeSanguin", "numSecuriteSociale", "adresse", "situation_famille",
    "periode_exposition", "medicaments", "affectionsCongenitales", "maladiesGenerales",
    "interventionsChirurgicales", "reactionsAllergiques", "notes",
    "nom", "prenom", "num_tel", "date_naissance", "statut"
  ];

  for (const field of otherFields) {
    if (field in input) updatedFields[field] = input[field];
  }

  // Mise à jour partielle
  await dossier.update(updatedFields);

  res.status(200).json({
    message: "Dossier médical mis à jour avec succès",
    dossier,
  });
});


/**
 * GET - Récupérer le dossier médical d’un patient (patient lui-même)
 */
exports.getDossierMedicalByPatient = async (req, res) => {
  const { email } = req.params;
  const tokenEmail = req.user?.email;

  if (!tokenEmail || tokenEmail !== email) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  try {
    const rows = await db.query(
      `SELECT dm.* 
       FROM Dossier_Medical dm
       INNER JOIN Utilisateur u ON dm.utilisateur_id = u.id
       WHERE u.email = ?`,
      {
        replacements: [email],
        type: db.QueryTypes.SELECT,
      }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erreur récupération dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
