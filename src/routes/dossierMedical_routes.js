const express = require("express");
const router = express.Router();
const { createMedicalRecord } = require("../controllers/dossierMedicalController");
const DossierMedical = require("../models/dossierMedicalModel");
const { authMiddleware, doctorMiddleware } = require("../middlewares/authMiddleware");

// POST endpoint to create a medical record
router.post("/create", authMiddleware, doctorMiddleware, async (req, res) => {
  const {
    date_creation,
    groupeSanguin,
    numSecuriteSociale,
    lieu_naissance,
    adresse,
    situation_famille,
    date_admis,
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
    patient_id
  } = req.body;

  try {
    const dossier = await DossierMedical.create({
      date_creation,
      groupeSanguin,
      numSecuriteSociale,
      lieu_naissance,
      adresse,
      situation_famille,
      date_admis,
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
      patient_id
    });
    res.status(201).json(dossier);  // Send the created dossier back as a response
  } catch (error) {
    console.error(error);
    console.log()
    res.status(500).json({ message: "Error creating medical record" });
  }
});

// GET endpoint to retrieve a medical record by patient_id
router.get("/get/:patient_id", authMiddleware, async (req, res) => {
  const { patient_id } = req.params;  // Extract patient_id from URL parameters

  try {
    // Find the medical record by patient_id
    const dossier = await DossierMedical.findOne({ where: { patient_id } });

    if (!dossier) {
      return res.status(404).json({ message: "Medical record not found for this patient" });
    }

    // Send the found medical record as the response
    res.status(200).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving medical record" });
  }
});


module.exports = router;
