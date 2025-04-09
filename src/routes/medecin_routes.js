const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");
const {
  authMiddleware,
  adminMiddleware,
  doctorMiddleware,
} = require("../middlewares/authMiddleware");
const { getMedicalRecord, createMedicalRecord } = require("../controllers/dossierMedicalController");
const {updateMedicalRecord} = require("../controllers/dossierMedicalController");


router.post("/register",authMiddleware, adminMiddleware, (req, res) => register(req, res, "Medecin"));
router.post("/dossier-medical-create/",authMiddleware, doctorMiddleware,createMedicalRecord );
router.get("/get-dossier-medical/:email",authMiddleware, doctorMiddleware,getMedicalRecord );
router.put("/medical-records-update/:email",authMiddleware, doctorMiddleware,updateMedicalRecord );

module.exports = router; // Make sure you're exporting the router correctly
