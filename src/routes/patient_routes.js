const express = require("express");
const {
  register,
  login,
  getActivePatients,
  logout,
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
} = require("../controllers/rendezVousController");

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

// Image upload route
router.post("/upload-id-photo", uploadMiddleware, uploadImage);
router.get("/get-patient-photo/:id", getPatientPhoto);

router.post("/logout", logout);

//demande d'un rendezvous
router.post("/demanderdv/:email", demanderRendezVous);

//annuler un rendezvous
router.put("/annulerdv/:id_rdv", annulerRendezVous);

module.exports = router;
