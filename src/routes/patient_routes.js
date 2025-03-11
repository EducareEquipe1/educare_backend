const express = require("express");
const { register, login } = require("../controllers/authController");
const { sendEmailVerification, activateAccount } = require("../controllers/emailController");
const { forgotPassword, resetPassword, setNewPassword } = require("../controllers/passwordController");

const router = express.Router();

/**
 * @swagger
 * /patients/register:
 *   post:
 *     summary: Register a new patient
 *     description: Creates a new patient account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ni.merzouk@esi-sba.dz"
 *               password:
 *                 type: string
 *                 example: "hashedpassword"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 example: "2004-03-02"
 *               phone:
 *                 type: string
 *                 example: "666666"
 *               matricule:
 *                 type: string
 *                 example: "4444444"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register",(req, res) => register(req, res, "Patient"));

/**
 * @swagger
 * /patients/login:
 *   post:
 *     summary: Login patient
 *     description: Logs in a patient with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ni.merzouk@esi-sba.dz"
 *               password:
 *                 type: string
 *                 example: "yourpassword"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", login);

/**
 * @swagger
 * /patients/send-email-verification:
 *   post:
 *     summary: Send email verification
 *     description: Sends an email verification link to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ni.merzouk@esi-sba.dz"
 *     responses:
 *       201:
 *         description: Verification email sent
 */
router.post("/send-email-verification", sendEmailVerification);

/**
 * @swagger
 * /patients/activate/{token}:
 *   get:
 *     summary: Activate account
 *     description: Activates a patient's account using a token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account activated
 *       400:
 *         description: Invalid or expired token
 */
router.get("/activate/:token", activateAccount);

/**
 * @swagger
 * /patients/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Sends a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ni.merzouk@esi-sba.dz"
 *     responses:
 *       200:
 *         description: Password reset link sent
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /patients/reset-password/{token}:
 *   get:
 *     summary: Validate password reset token
 *     description: Checks if a password reset token is valid.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid, user can reset password
 *       400:
 *         description: Invalid or expired token
 */
router.get("/reset-password/:token", resetPassword);


/**
 * @swagger
 * /patients/set-new-password:
 *   post:
 *     summary: Set a new password
 *     description: Updates a user's password after verifying the reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "jwt-reset-token"
 *               newPassword:
 *                 type: string
 *                 example: "newsecurepassword"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid token or request
 */
router.post("/set-new-password", setNewPassword);

module.exports = router;
