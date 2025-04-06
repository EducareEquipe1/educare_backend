const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");
const {
  authMiddleware,
  adminMiddleware,
  doctorMiddleware,
} = require("../middlewares/authMiddleware");
const { getMedicalRecord, createMedicalRecord } = require("../controllers/dossierMedicalController");



router.post("/register",authMiddleware, adminMiddleware, (req, res) => register(req, res, "Medecin"));
router.post("/dossier-medical-create",authMiddleware, doctorMiddleware,createMedicalRecord );
router.get("/get-dossier-medical/:patient_id",authMiddleware, doctorMiddleware,getMedicalRecord );


module.exports = router; // ✅ Make sure you're exporting the router correctly
