const express = require("express");
const {
  register,
  login,
  getActivePatients,
} = require("../controllers/authController");
const {
  sendEmailVerification,
  activateAccount,
} = require("../controllers/emailController");
const {
  forgotPassword,
  setNewPassword,
} = require("../controllers/passwordController");
const {
  modifyProfileInformations,
} = require("../controllers/modifyProfileController");
const {
  uploadImage,
  uploadMiddleware,
  getPatientPhoto,
} = require("../controllers/faceValidationController");

const router = express.Router();

// Authentication routes
router.post("/register", (req, res) => register(req, res, "Patient"));
router.post("/login", login);
router.get("/active", getActivePatients);

// Email verification routes
router.post("/send-email-verification", sendEmailVerification);
router.get("/activate/:token", activateAccount);

// Password management routes
router.post("/forgot-password", forgotPassword);
router.post("/set-new-password", setNewPassword);

// Profile management routes
router.patch("/modify-profile/:email", modifyProfileInformations);

// Image upload route
router.post("/upload-id-photo", uploadMiddleware, uploadImage);
router.get("/get-patient-photo/:id", getPatientPhoto);

module.exports = router;
