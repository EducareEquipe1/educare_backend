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

const { programmerRendezVous,getDemandesRendezVousByPatientEmail,
  getRendezVousByPatientEmail,programmerRendezVousParMedecin,programmerDirectementRendezVous,modifierRendezVous,
  refuserRendezVous,annulerRendezVous,terminerRendezVous,getConsultation,listeRendezVousDemandes ,
  listeRendezVous} =require("../controllers/rendezVousController")




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
const { deleteOrdonnance, deleteConsultation } = require("../models/consultationModel");


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
  "/examen-medical-create/:id",
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
  "/create-ordonnance/:consultation_id",
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
router.get(
  "/get-consultation/:id",
  authMiddleware,
  doctorMiddleware,
  getConsultationsbyIdController
);
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
router.post("/programmerrdvdirect",
  authMiddleware,
doctorMiddleware,
programmerDirectementRendezVous);

//programmer un rendezvous demandé par le patient
router.put("/programmerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware,
  programmerRendezVous

);
//programmer rendez vous par medecin quand il le programme apres la consultation de listes patient
router.post("/programmerdvpatient/:email",
  authMiddleware,
  doctorMiddleware,
  programmerRendezVousParMedecin
);

//  //programmer un rendez vous depuis le bouton ajoiter du calendrier
router.post("/programmerrdvdirect",
  authMiddleware,
  doctorMiddleware,
  programmerDirectementRendezVous
);

//modifier un rendezvous
router.patch("/modifierrdv/:id_rdv",
  authMiddleware,
  doctorMiddleware,
  modifierRendezVous
);
/*
//terminer un rendezvous
router.put("/terminerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware, 
  terminerRendezVous);
  //annuler un rendez vous
  router.put("/annulerdv/:id_rdv",
    authMiddleware,
    doctorMiddleware, 
    annulerRendezVous);
    //annuler un rendez 
//refuser un rendez vous
router.put("/refuserdv/:id_rdv",
  authMiddleware,
  doctorMiddleware, 
  refuserRendezVous);*/

  //get consultation du rendezvous
  router.get("/consultation/:id_rdv",
    authMiddleware,
    getConsultation);
   // get liste des rendez vous
    router.get('/listedesrendezvous',
    listeRendezVous);
    // gte liste des demandes
router.get('/listedesdemandes',
  listeRendezVousDemandes);
//liste rendezvous dun seul patient
router.get('/listerendezvousdupatient/:email',
  getRendezVousByPatientEmail);

  //liste des demandes rendezvous dun seul patient
router.get('/listedemandesdupatient/:email',
  getDemandesRendezVousByPatientEmail);

  
module.exports = router; 
