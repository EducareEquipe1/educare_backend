const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

const{countPatients,getAnneeUniversitaire,countConsultations,countMaladiesContagieuses,getConsultationsParCategorieAnnuelle,getConsultationStats,getConsultationsParMois}= require("../controllers/statistiquesController");
router.get("/patientCount",countPatients);
router.get("/countConsultations",countConsultations);
router.get("/casContagieuse",countMaladiesContagieuses);
router.get("/consultation_stats/:year",getConsultationStats);
router.get("/getConsultationsParCategorieAnnuelle/:year", getConsultationsParCategorieAnnuelle);
router.get("/getConsultationsParMois/:annee",getConsultationsParMois);
router.post("/register",authMiddleware, adminMiddleware, (req, res) => register(req, res, "Directeur"));
module.exports = router; // ✅ Make sure you're exporting the router correctly
