const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

const{countPatients,getAnneeUniversitaire,countConsultations,countMaladiesContagieuses,
  getRepartitionPatientsParCategorie,getConsultationsParCategorieAnnuelle,getConsultationStats, getStatsMaladies
  ,getMaladiesParMois,getConsultationsParMois,getStatistiquesMaladiesParTypeEtAnnee}= require("../controllers/statistiquesController");
router.get("/patientCount",countPatients);
router.get("/countConsultations",countConsultations);
router.get("/casContagieuse",countMaladiesContagieuses);
router.get("/consultation_stats/:year",getConsultationStats);
router.get("/getConsultationsParCategorieAnnuelle/:year", getConsultationsParCategorieAnnuelle);
router.get("/getConsultationsParMois/:annee",getConsultationsParMois);
router.post("/register",authMiddleware, adminMiddleware, (req, res) => register(req, res, "Directeur"));
router.get("/getRepartitionPatientsParCategorie",getRepartitionPatientsParCategorie);
router.get("/getMaladiesParMois/:annee/:type",getMaladiesParMois);
router.get("/getStatistiquesMaladiesParTypeEtAnnee/:type/:annee",getStatistiquesMaladiesParTypeEtAnnee);
router.get("/getStatsMaladies/:type/:annee", getStatsMaladies);
module.exports = router; // ✅ Make sure you're exporting the router correctly
