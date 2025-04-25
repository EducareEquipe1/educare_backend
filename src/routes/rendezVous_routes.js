const express = require("express");
const router = express.Router();
const controller = require("../controllers/rendezVousController");
const { authMiddleware, doctorMiddleware } = require("../middlewares/authMiddleware");

router.post("/demande",authMiddleware, controller.demanderRendezVous);
router.put("/programmer/:id_rdv",authMiddleware,doctorMiddleware controller.programmerRendezVous);
router.put("/annuler/:id_rdv",authMiddleware,controller.annulerRendezVous);
router.put("/terminer/:id_rdv",authMiddleware,doctorMiddleware, controller.terminerRendezVous);
router.get("/consultation/:id_rdv",authMiddleware,controller.getConsultation);

module.exports = router;