const connection = require("../db"); // Import the database connection
const {
  findUserByEmail,
  findPatientByEmail,
} = require("../models/authPatientModel");
const Patient = require("../models/authPatientModel");
const {
  createExamenMedical,
  createConsultation,
  getConsultationsByPatientId,
  ModifyConsultation,
  createOrdonnance,
  addMedicaments,
  getMedicamentsByOrdonnance,
  deleteOrdonnance,
  deleteConsultation,
  getConsultationId,
} = require("../models/consultationModel");
exports.createExamenMedical = async (req, res) => {
  const { id } = req.params; // consultation_id
  const {
    poids,
    taille,
    IMC,
    tension,
    vision_d,
    vision_g,
    larmoiement,
    douleurs,
    taches_yeux,
    audition_d,
    audition_g,
    sifflements,
    angines,
    epistaxis,
    rhinorrhee,
    cephalies,
    vertiges,
    troubles_sommeil,
    peau_normal,
    peau_anormale,
    douleurs_musculaires,
    douleurs_articulaires,
    douleurs_neurologiques,
    toux,
    dyspnee,
    douleurs_thoraciques,
    palpitations,
    oedemes,
    cyanose,
    pyrosis,
    vomissements,
    douleurs_abdominales,
    dysurie,
    hematurie,
    cycles_irreguliers,
    fonction_respiratoire,
    fonction_circulatoire,
    fonction_motrice,
    sanguins,
    urinaires,
    radiologiques,
    hepatites_pos,
    hepatites_neg,
    syphilis_pos,
    syphilis_neg,
    vih_pos,
    vih_neg,
  } = req.body;

  try {
    const newExam = await createExamenMedical({
      consultation_id: id,
      poids,
      taille,
      IMC,
      tension,
      vision_d,
      vision_g,
      larmoiement,
      douleurs,
      taches_yeux,
      audition_d,
      audition_g,
      sifflements,
      angines,
      epistaxis,
      rhinorrhee,
      cephalies,
      vertiges,
      troubles_sommeil,
      peau_normal,
      peau_anormale,
      douleurs_musculaires,
      douleurs_articulaires,
      douleurs_neurologiques,
      toux,
      dyspnee,
      douleurs_thoraciques,
      palpitations,
      oedemes,
      cyanose,
      pyrosis,
      vomissements,
      douleurs_abdominales,
      dysurie,
      hematurie,
      cycles_irreguliers,
      fonction_respiratoire,
      fonction_circulatoire,
      fonction_motrice,
      sanguins,
      urinaires,
      radiologiques,
      hepatites_pos,
      hepatites_neg,
      syphilis_pos,
      syphilis_neg,
      vih_pos,
      vih_neg,
    });

    return res.status(201).json(newExam);
  } catch (error) {
    console.error("Error creating examen medical:", error);

    // ✨ If the examen already exists
    if (typeof error === "object" && error.code === "EXISTING_EXAM") {
      return res.status(400).json({ message: error.message });
    }

    // Otherwise, real server error
    return res
      .status(500)
      .json({ message: "Server error while creating examen medical" });
  }
};
exports.createConsultation = async (req, res) => {
  const { email } = req.params;
  const {
    type,
    symptomes,
    observations,
    diagnostic,
    piece,
    motif,
    id_rendezVous,
  } = req.body;

  const date = new Date().toISOString().slice(0, 10);

  try {
    // Find user by email
    const user = await findPatientByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Patient not found with this email" });
    }
    console.log("the user id ", user.id);

    // Create the consultation record
    const newConsultation = await createConsultation({
      patient_id: user.id,
      date: new Date(date).toISOString().slice(0, 10), // ensures 'YYYY-MM-DD'
      type,
      symptomes,
      observations,
      diagnostic,
      piece,
      motif,
      id_rendezVous,
    });

    return res.status(201).json(newConsultation);
  } catch (error) {
    console.error("Error creating consultation:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating consultation" });
  }
};
exports.modifyConsultation = async (req, res) => {
  const { id_consultation } = req.params;
  const updateFields = { ...req.body };

  // Optional: always update the date if required
  updateFields.date = new Date().toISOString().slice(0, 10);

  try {
    const result = await ModifyConsultation(id_consultation, updateFields);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error modifying consultation:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating consultation" });
  }
};

exports.createOrdonnanceController = async (req, res) => {
  const { consultation_id } = req.params;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const newOrdonnance = await createOrdonnance({
      date,
      consultation_id,
    });

    return res.status(201).json(newOrdonnance);
  } catch (error) {
    console.error("Error creating ordonnance:", error);
    return res.status(500).json({
      message: "❌ Server error while creating ordonnance",
      error,
    });
  }
};

exports.getConsultationsbyEmailController = async (req, res) => {
  const { email } = req.params;

  try {
    const patient = await Patient.findPatientByEmail(email);
    const consultations = await getConsultationsByPatientId(patient.id);

    if (!consultations || consultations.length === 0) {
      return res
        .status(404)
        .json({ message: "No consultations found for this patient." });
    }

    return res.status(200).json(consultations);
  } catch (error) {
    console.error("❌ Error fetching consultations:", error);
    return res.status(500).json({
      message: "Server error while retrieving consultations.",
      error,
    });
  }
};
exports.getConsultationsbyIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const consultation = await getConsultationId(id);

    if (!consultation || consultation.length === 0) {
      return res
        .status(404)
        .json({ message: "No consultations found for this patient." });
    }

    return res.status(200).json(consultation);
  } catch (error) {
    console.error("❌ Error fetching consultations:", error);
    return res.status(500).json({
      message: "Server error while retrieving consultations.",
      error,
    });
  }
};
exports.addMedicamentsToOrdonnance = async (req, res) => {
  const { id_ordonnance, id_medicament } = req.params; // from URL params
  const { duree } = req.body; // from request body

  if (!id_ordonnance || !id_medicament || !duree) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const result = await addMedicaments({
      id_ordonnance,
      medicament_id: id_medicament,
      duree,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.toString() });
  }
};

exports.fetchMedicamentsForOrdonnance = async (req, res) => {
  const { id } = req.params; // ordonnance_id
  const ordonnanceId = parseInt(id, 10);
  if (isNaN(ordonnanceId)) {
    return res.status(400).json({ error: "Invalid ordonnance ID" });
  }

  try {
    const meds = await getMedicamentsByOrdonnance(ordonnanceId);
    if (!meds.length) {
      return res
        .status(404)
        .json({ message: "No medicaments found for this ordonnance." });
    }

    res.status(200).json({
      ordonnance_id: ordonnanceId,
      ordonnance_date: meds[0].ordonnance_date, // Accessing the ordonnance date
      medicaments: meds,
    });
  } catch (error) {
    console.error("❌ Error in fetchMedicamentsForOrdonnance:", error);
    res.status(500).json({ error: "Server error while fetching medicaments." });
  }
};

exports.deleteOrdonnanceController = async (req, res) => {
  const { id } = req.params;
  console.log("🧹 Deleting ordonnance with id:", id);
  console.log(id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ordonnance ID" });
  }

  try {
    const result = await deleteOrdonnance(id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error in deleteOrdonnanceController:", err);
    return res
      .status(500)
      .json({ error: "Server error while deleting ordonnance" });
  }
};

exports.deleteConsultationController = async (req, res) => {
  const { id } = req.params;
  console.log("🧹 Deleting consultation with id:", id);
  console.log(id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid consultation ID" });
  }

  try {
    const result = await deleteConsultation(id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error in deleteconsultationController:", err);
    return res
      .status(500)
      .json({ error: "Server error while deleting consultation" });
  }
};
