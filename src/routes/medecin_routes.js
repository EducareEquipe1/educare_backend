const express = require("express");
const router = express.Router();
const { register} = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /medecins/register:
 *   post:
 *     summary: Register a new medecin
 *     description: Creates a new doctor account
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
 *                 example: "nabahat"
 *               first_name:
 *                 type: string
 *                 example: "merzouk"
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
router.post("/register",verifyToken, authorizeRoles("admin") ,
(req, res) => register(req, res, "Medecin"));

module.exports = router; // ✅ Make sure you're exporting the router correctly
