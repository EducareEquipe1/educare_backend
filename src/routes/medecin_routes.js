const express = require("express");
const router = express.Router();
const { register } = require("../controllers/authController");
const {
  authMiddleware,
  adminMiddleware,
  doctorMiddleware,
} = require("../middlewares/authMiddleware");

const { getUserMedicalInfo,getMedicalRecord, createMedicalRecord } = require("../controllers/dossierMedicalController");
const {updateMedicalRecord} = require("../controllers/dossierMedicalController");


router.post("/register",authMiddleware, adminMiddleware, (req, res) => register(req, res, "Medecin"));
router.post("/dossier-medical-create/:email",authMiddleware, doctorMiddleware,createMedicalRecord );
router.get("/get-dossier-medical/:email",authMiddleware, doctorMiddleware,getMedicalRecord );
router.put("/medical-records-update/:email",authMiddleware, doctorMiddleware,updateMedicalRecord );
router.get("/get-user-info/:email",authMiddleware, doctorMiddleware,getUserMedicalInfo);

const {
  getMedicalRecord,
  createMedicalRecord,
} = require("../controllers/dossierMedicalController");
const {
  updateMedicalRecord,
} = require("../controllers/dossierMedicalController");
const { getUtilisateur } = require("../controllers/getUsersController");

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


module.exports = router; // Make sure you're exporting the router correctly
