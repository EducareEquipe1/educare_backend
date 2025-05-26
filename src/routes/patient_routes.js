const express = require("express");
const {
  register,
  login,
  getActivePatients,
  logout,
  getPatientByEmail, // Add this import
} = require("../controllers/authController");
const {
  sendEmailVerification,
  activateAccount,
  checkVerificationStatus, // Add this import
} = require("../controllers/emailController");
const {
  forgotPassword,
  setNewPassword,
} = require("../controllers/passwordController");
const {
  modifyProfileInformations,
  getUserProfileController,
} = require("../controllers/modifyProfileController");
const {
  uploadImage,
  uploadMiddleware,
  getPatientPhoto,
} = require("../controllers/faceValidationController");
const {
  demanderRendezVous,
  annulerRendezVous,
  getRendezVousByPatientEmail,
  getDemandesRendezVousByPatientEmail,
  getNextRendezVousByPatientEmail,
} = require("../controllers/rendezVousController");
const {
  getDossierMedicalByPatient,
} = require("../controllers/dossierMedicalController");
const { patientAuth } = require("../middlewares/authMiddleware");
const {
  getConsultationsbyEmailController,
  fetchMedicamentsForOrdonnance,
  getOrdonnanceByConsultationId, // <-- ADD THIS LINE
} = require("../controllers/consultationController");

const router = express.Router();

// Authentication routes
router.post("/register", (req, res) => register(req, res, "Patient"));
router.post("/login", login);
router.get("/active", getActivePatients);

// Email verification routes
router.post("/send-email-verification", sendEmailVerification);
router.get("/activate/:token", activateAccount);
router.get("/verify-status/:email", checkVerificationStatus); // Update this line - make sure it's exactly as shown

// Password management routes
router.post("/forgot-password", forgotPassword);
router.post("/set-new-password", setNewPassword);

// Profile management routes
router.patch("/modify-profile/:email", modifyProfileInformations);
router.get("/modify-profile/:email", getUserProfileController);
router.get("/profile/:email", getPatientByEmail); // Add this line

// Image upload route
router.post("/upload-id-photo", uploadMiddleware, uploadImage);
router.get("/get-patient-photo/:email", getPatientPhoto);

router.post("/logout", logout);

//demande d'un rendezvous
router.post("/demanderdv/:email", demanderRendezVous);

//annuler un rendezvous
router.put("/annulerdv/:id_rdv", annulerRendezVous);

//liste rendezvous dun seul patient
router.get("/listerendezvousdupatient/:email", getRendezVousByPatientEmail);

//liste des demandes rendezvous dun seul patient
router.get(
  "/listedemandesdupatient/:email",
  getDemandesRendezVousByPatientEmail
);

// Patient fetches their own dossier médical (secured)
router.get("/dossier-medical/:email", patientAuth, getDossierMedicalByPatient);
router.get("/next-rendezvous/:email", getNextRendezVousByPatientEmail);
router.get("/consultations/:email", getConsultationsbyEmailController);
router.get("/ordonnance/:id", fetchMedicamentsForOrdonnance);
router.get(
  "/ordonnance/by-consultation/:consultationId",
  getOrdonnanceByConsultationId
);

module.exports = router;
