const express = require("express");
const { register, login ,getActivePatients } = require("../controllers/authController");
const {
  sendEmailVerification,
  activateAccount,
} = require("../controllers/emailController");
const {
  forgotPassword,
  resetPassword,
  setNewPassword,
} = require("../controllers/passwordController");

const router = express.Router();

router.post("/register", (req, res) => register(req, res, "Patient"));
router.post("/login", login);
router.post("/send-email-verification", sendEmailVerification);
router.get("/activate/:token", activateAccount);
router.post("/forgot-password", forgotPassword);
router.post("/set-new-password", setNewPassword);

module.exports = router;
