const express = require("express");
const router = express.Router();
const authPatientController = require("../controllers/authPatientController");

// Sign Up (Register)
router.post("/patientRegister", authPatientController.registerPatient);

// Sign In (Login)
router.post("/patientLogin", authPatientController.loginPatient);
router.get("/activate/:token", authPatientController.activateAccount);
router.post("/sendVerificationEmail", authPatientController.sendEmailVerification);
router.post("/forgetPassword", authPatientController.forgotPassword);
router.post("/reset-password/:token", authPatientController.resetPassword);




module.exports = router;
