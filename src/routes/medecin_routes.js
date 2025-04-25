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
const { getUtilisateur } = require("../controllers/getUsersController");

const { searchPatients, searchMedicaments } = require("../controllers/searchControllers");



const {programmerRendezVous,getDemandesRendezVousByPatientEmail,getRendezVousByPatientEmail,programmerRendezVousParMedecin,refuserRendezVous, annulerRendezVous,terminerRendezVous,getConsultation,listeDemandesRendezVous ,listeRendezVous} =require("../controllers/rendezVousController")

const {
  createExamenMedical,
  createConsultation,
  getConsultationsbyEmailController,
  modifyConsultation,
  addMedicamentsToOrdonnance,
  createOrdonnanceController,
  fetchMedicamentsForOrdonnance,
} = require("../controllers/consultationController");
const { deleteOrdonnance } = require("../models/consultationModel");


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
router.put(
  "/medical-records-update/:email",
  authMiddleware,
  doctorMiddleware,
  updateMedicalRecord
);
// ✅ modified to be compatible with new directeur strecture
router.get(
  "/get-utilisateur/:email",
  authMiddleware,
  doctorMiddleware,
  getUtilisateur
);

//we test it this way ! search-patient?q=amine
router.get("/search-patient", authMiddleware, doctorMiddleware, searchPatients);
router.post(
  "/consultation-create/:email",
  authMiddleware,
  doctorMiddleware,
  createConsultation
);
router.post(
  "/examen-medical-create/:email",
  authMiddleware,
  doctorMiddleware,
  createExamenMedical
);
router.put(
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
router.get("/search-medicament", authMiddleware, doctorMiddleware, searchMedicaments);

router.post(
  "/create-ordenance/:consultation_id",
  authMiddleware,
  doctorMiddleware,
  createOrdonnanceController
);
router.post(
  "/add-medicament",
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
router.delete(
  "/delete-ordonnance/:id",
  authMiddleware,
  doctorMiddleware,
  deleteOrdonnance
);


//terminer un rendezvous
router.put("/terminerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware, 
  terminerRendezVous);
//refuser un rendez vous
router.put("/refuserdv/:id_rdv",
  authMiddleware,
  doctorMiddleware, 
  refuserRendezVous);
  //get consultation du rendezvous
  router.get("/consultation/:id_rdv",
    authMiddleware,
    getConsultation);
   // get liste des rendez vous
    router.get('/listedesrendezvous',
    listeRendezVous);
    // gte liste des demandes
router.get('/listedesdemandes',
listeDemandesRendezVous);
//liste rendezvous dun seul patient
router.get('/listerendezvousdupatient/:email',
  getRendezVousByPatientEmail);

  //liste des demandes rendezvous dun seul patient
router.get('/listedemandesdupatient/:email',
  getDemandesRendezVousByPatientEmail);

module.exports = router; 
