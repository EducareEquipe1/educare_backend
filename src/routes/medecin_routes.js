const express = require("express");

const router = express.Router();

const { register } = require("../controllers/authController");
const {
  authMiddleware,
  adminMiddleware,
  doctorMiddleware,
} = require("../middlewares/authMiddleware");

const {
  getUserMedicalInfo,
  getMedicalRecord,
  createMedicalRecord,
} = require("../controllers/dossierMedicalController");
const {
  updateMedicalRecord,
} = require("../controllers/dossierMedicalController");
const {
  getUtilisateur,
  getAllPatients,
} = require("../controllers/getUsersController");

const {
  searchPatients,
  searchMedicaments,searchMaladies,
} = require("../controllers/searchControllers");

const {
  programmerRendezVous,
  getDemandesRendezVousByPatientEmail,
  getRendezVousByPatientEmail,
  programmerRendezVousParMedecin,
  programmerDirectementRendezVous,
  modifierRendezVous,
  refuserRendezVous,
  annulerRendezVous,
  terminerRendezVous,
  getConsultation,
  listeRendezVousDemandes,
  listeRendezVous,
 bullkScheduleAppointmentsFromExcel,
} = require("../controllers/rendezVousController");

const {
  createExamenMedical,
  createConsultation,
  getConsultationsbyEmailController,
  modifyConsultation,
  addMedicamentsToOrdonnance,
  createOrdonnanceController,
  fetchMedicamentsForOrdonnance,
  deleteOrdonnanceController,
  deleteConsultationController,
  getConsultationsbyIdController,
} = require("../controllers/consultationController");
const {
  hasMaladieForPatient,
  getMaladiesForPatient,
} = require("../controllers/statistiquesController.js");

const consultationController = require("../controllers/consultationController");

router.get("/searchMaladies",
   authMiddleware,
  doctorMiddleware,
  searchMaladies);

router.get(
  "/consultations/:consultation_id/medicaments",
  consultationController.getMedicamentsByConsultationId
);
router.get(
  "/consultations/:consultation_id/has-ordonnance",
  consultationController.hasOrdonnanceForConsultation
);
router.get(
  "/consultations/:consultation_id/examen-medical",
  consultationController.getExamenMedical
);
router.get(
  "/consultations/:consultation_id/has-examen-medical",
  consultationController.hasExamenMedicalForConsultation
);
router.get("/has-hasMaladieForPatient/:id_patient", hasMaladieForPatient);
router.get(
  "/get-medicaments/:id_patient",
  getMaladiesForPatient
);
router.post("/register", authMiddleware, adminMiddleware, (req, res) =>
  register(req, res, "Medecin")
);
router.post(
  "/dossier-medical-create/:email",
  authMiddleware,
  doctorMiddleware,
  createMedicalRecord
);
router.get(
  "/get-dossier-medical/:email",
  authMiddleware,
  doctorMiddleware,
  getMedicalRecord
);
router.put(
  "/medical-records-update/:email",
  authMiddleware,
  doctorMiddleware,
  updateMedicalRecord
);
router.get(
  "/get-user-info/:email",
  authMiddleware,
  doctorMiddleware,
  getUserMedicalInfo
);

router.post("/register", authMiddleware, adminMiddleware, (req, res) =>
  register(req, res, "Medecin")
);
router.post(
  "/dossier-medical-create/:email",
  authMiddleware,
  doctorMiddleware,
  createMedicalRecord
);
router.get(
  "/get-dossier-medical/:email",
  authMiddleware,
  doctorMiddleware,
  getMedicalRecord
);

// ✅ modified to be compatible with new directeur strecture
router.get(
  "/get-utilisateur/:email",
  authMiddleware,
  doctorMiddleware,
  getUtilisateur
);
router.get("/get-patient/", authMiddleware, doctorMiddleware, getAllPatients);
//we test it this way ! search-patient?q=amine
router.get("/search-patient", authMiddleware, doctorMiddleware, searchPatients);
router.post(
  "/consultation-create/:email",
  authMiddleware,
  doctorMiddleware,
  createConsultation
);
router.post(
  "/examen-medical-create/:id",
  authMiddleware,
  doctorMiddleware,
  createExamenMedical
);
router.patch(
  "/modify-consultation/:id_consultation",
  authMiddleware,
  doctorMiddleware,
  modifyConsultation
);

router.get(
  "/consultations-patient/:email",
  authMiddleware,
  doctorMiddleware,
  getConsultationsbyEmailController
);
router.get(
  "/search-medicament",
  authMiddleware,
  doctorMiddleware,
  searchMedicaments
);

router.post(
  "/create-ordonnance/:consultation_id",
  authMiddleware,
  doctorMiddleware,
  createOrdonnanceController
);
router.post(
  "/add-medicament/:id_ordonnance/:id_medicament",
  authMiddleware,
  doctorMiddleware,
  addMedicamentsToOrdonnance
);
router.get(
  "/get-ordonnance/:id",
  authMiddleware,
  doctorMiddleware,
  fetchMedicamentsForOrdonnance
);
router.get(
  "/get-consultation/:id",
  authMiddleware,
  doctorMiddleware,
  getConsultationsbyIdController
);
router.get("/get-patients/", authMiddleware, doctorMiddleware, getAllPatients);
router.delete(
  "/delete-ordonnance/:id",
  authMiddleware,
  doctorMiddleware,
  deleteOrdonnanceController
);
router.delete(
  "/delete-consultation/:id",
  authMiddleware,
  doctorMiddleware,
  deleteConsultationController
);

//programmer un rendezvous demandé par le patient
router.put(
  "/programmerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware,
  programmerRendezVous
);
//programmer rendez vous par medecin quand il le programme apres la consultation de listes patient
router.post(
  "/programmerdvpatient/:email",
  authMiddleware,
  doctorMiddleware,
  programmerRendezVousParMedecin
);

//  //programmer un rendez vous depuis le bouton ajoiter du calendrier
router.post(
  "/programmerrdvdirect",
  authMiddleware,
  doctorMiddleware,
  programmerDirectementRendezVous
);

//modifier un rendezvous
router.patch(
  "/modifierrdv/:id_rendezVous",
  authMiddleware,
  doctorMiddleware,
  modifierRendezVous
);

//annuler un rendez vous
router.put(
  "/annulerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware,
  annulerRendezVous
);
//annuler un rendez

//annuler un rendez vous
router.put(
  "/annulerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware,
  annulerRendezVous
);

//refuser un rendez vous
router.put(
  "/refuserdv/:id_rdv",
  authMiddleware,
  doctorMiddleware,
  refuserRendezVous
);

// get liste des rendez vous
router.get("/listedesrendezvous", listeRendezVous);
// gte liste des demandes
router.get("/listedesdemandes", listeRendezVousDemandes);
//liste rendezvous dun seul patient
router.get("/listerendezvousdupatient/:email", getRendezVousByPatientEmail);

//liste des demandes rendezvous dun seul patient
router.get(
  "/listedemandesdupatient/:email",
  getDemandesRendezVousByPatientEmail
);
const multer = require("multer");
const path = require("path");

// Destination et nom du fichier

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Assure-toi que ce dossier existe
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 🔐 Filtrage pour accepter seulement les .xlsx
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers Excel (.xlsx) sont acceptés"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/bulk-schedule",
  upload.single("file"),
  bullkScheduleAppointmentsFromExcel
);
const{countPatients,getAnneeUniversitaire,countConsultations,countMaladiesContagieuses,
 getRepartitionPatientsParCategorie,getMedicamentsPlusPrescrits,getConsultationStats,ajouterMaladieAuPatient,
  getConsultationsParMois}= require("../controllers/statistiquesController");
router.get("/patientCount",countPatients);
router.get("/countConsultations",countConsultations);
router.get("/casContagieuse",countMaladiesContagieuses);
router.get("/consultation_stats/:year",getConsultationStats);
router.get("/getConsultationsParMois/:annee",getConsultationsParMois);
router.get("/getMedicamentsPlusPrescrits", getMedicamentsPlusPrescrits);
router.get("/getRepartitionPatientsParCategorie",getRepartitionPatientsParCategorie);
router.post("/ajouterMaladieAuPatient",ajouterMaladieAuPatient );

module.exports = router;
