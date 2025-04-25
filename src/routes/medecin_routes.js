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
const { searchPatients } = require("../controllers/searchUsersControllers");
const {programmerRendezVous,programmerRendezVousParMedecin,refuserRendezVous, annulerRendezVous,terminerRendezVous,getConsultation,listeDemandesRendezVous ,listeRendezVous} =require("../controllers/rendezVousController")

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
router.get(
  "/get-utilisateur/:email",
  authMiddleware,
  doctorMiddleware,
  getUtilisateur
);

//we test it this way ! search-patient?q=amine
router.get(
  "/search-patient",
  authMiddleware,
  doctorMiddleware,
  searchPatients
);
//programmer un rendezvous
router.put("/programmerdv/:id_rdv",
  authMiddleware,
  doctorMiddleware ,
  programmerRendezVous
);
//programmer un rendez vous par medeciin uniquement
router.post("/programmerdvnondemande/:email",
  authMiddleware,
  doctorMiddleware ,
  programmerRendezVousParMedecin
);
//annuler un rendezvous
router.put("/annulerdv/:id_rdv",annulerRendezVous);

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

module.exports = router; 
