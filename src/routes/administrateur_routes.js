const express = require("express");
const { register, login } = require("../controllers/authController");

// ✅ Import from the correct controller file
const {
  getUtilisateurs,
  getAllMedecins,
  getActivePatients,
  getAllPatients,
} = require("../controllers/getUsersController"); // Change this path to match your project structure

const {
  archiveUtilisateur,
  restoreUtilisateur,
  getArchivedUtilisateurs,
} = require("../controllers/archiveController");
const router = express.Router();
const {
  authMiddleware,
  adminMiddleware,
  doctorMiddleware,
} = require("../middlewares/authMiddleware");
const {
  deleteUserByEmail,
  editMedecinStateByEmail,
} = require("../controllers/editUsersController");

router.post("/register", (req, res) => register(req, res, "Admin"));
router.get(
  "/get-active-patients",
  authMiddleware,
  doctorMiddleware,
  getActivePatients
);
router.get(
  "/get-all-patients",
  authMiddleware,
  doctorMiddleware,
  getAllPatients
);
router.get(
  "/get-all-medecins",
  authMiddleware,
  adminMiddleware,
  getAllMedecins
);
router.delete(
  "/delete-user/:email",
  authMiddleware,
  adminMiddleware,
  deleteUserByEmail
);
router.put(
  "/edit-medecin-state/:email",
  authMiddleware,
  adminMiddleware,
  editMedecinStateByEmail
);
router.post(
  "/archive-user/:email",
  authMiddleware,
  adminMiddleware,
  archiveUtilisateur
);
router.post(
  "/restore-user/:email",
  authMiddleware,
  adminMiddleware,
  restoreUtilisateur
);
router.get(
  "/get-archived-users",
  authMiddleware,
  adminMiddleware,
  getArchivedUtilisateurs
);

router.get("/get-users", authMiddleware, adminMiddleware, getUtilisateurs);

router.post(
  "/archive-dossier-medical/:email",
  authMiddleware,
  adminMiddleware,
  getArchivedUtilisateurs
);
module.exports = router; // ✅ Make sure you're exporting the router correctly
