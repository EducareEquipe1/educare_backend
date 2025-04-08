const DossierMedical = require("../models/dossierMedicalModel");
const asyncHandler = require("../middlewares/asyncHandler");

// POST endpoint to create a medical record
exports.createMedicalRecord = asyncHandler(async (req, res) => {
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
    email
  } = req.body;

  try {
    
    const dossierExists = await DossierMedical.findOne({ where: { email } });

    if (dossierExists) {
      return res.status(404).json({ message: "Medical record already exists" });
    }
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
      email
    });
    res.status(201).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating medical record" });
  }
});

// GET endpoint to retrieve a medical record by email
exports.getMedicalRecord = asyncHandler(async (req, res) => {
  const { email } = req.params; 

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
