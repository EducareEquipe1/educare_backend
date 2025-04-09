const express = require("express");
const router = express.Router();
const { createMedicalRecord, getMedicalRecord } = require("../controllers/dossierMedicalController");
const DossierMedical = require("../models/dossierMedicalModel");
const { authMiddleware, doctorMiddleware } = require("../middlewares/authMiddleware");

// POST endpoint to create a medical record
router.post("/create", authMiddleware, doctorMiddleware, async (req, res) => {
  const {
    date_creation,
    groupeSanguin,
    numSecuriteSociale,
    
    adresse,
    situation_famille,
    nom,
    prenom,
    num_tel,
    date_naissance,
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
    statut
  } = req.body;

  try {
    const dossier = await DossierMedical.create({
      date_creation,
      groupeSanguin,
      numSecuriteSociale,
     
      adresse,
    
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
      email
    });
    res.status(201).json(dossier);  // Send the created dossier back as a response
  } catch (error) {
    console.error(error);
    console.log()
    res.status(500).json({ message: "Error creating medical record" });
  }
});

// GET endpoint to retrieve a medical record by patient_id
router.get("/get/:email", authMiddleware,getMedicalRecord, async (req, res) => {
  const { email } = req.params;  // Extract patient_id from URL parameters

  try {
    // Find the medical record by patient_id
    const dossier = await DossierMedical.findOne({ where: { email } });

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

// PUT endpoint to update a medical record by patient_id
router.put("/update/:email", authMiddleware, doctorMiddleware,getMedicalRecord, async (req, res) => {
  const { email } = req.params;

  try {
    const dossier = await DossierMedical.findOne({ where: { email } });

    if (!dossier) {
      return res.status(404).json({ message: "Medical record not found for this patient" });
    }

    // Update fields with new values from the request body
    await dossier.update(req.body);

    res.status(200).json({ message: "Medical record updated successfully", dossier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating medical record" });
  }
});


module.exports = router;
