const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/authPatientModel");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getActivePatients = asyncHandler(async (req, res) => {
  const activePatients = await Patient.getActivePatients();
  res.json(activePatients);
});

exports.getAllPatients = asyncHandler(async (req, res) => {
  const allPatients = await Patient.getAllPatients();
  res.json(allPatients);
});

exports.getAllMedecins = asyncHandler(async (req, res) => {
  const allMedecins = await Patient.getAllMedecins();
  res.json(allMedecins);
});

exports.getUtilisateurs = async (req, res) => {
  try {
    // Fetch archived utilisateurs from the model
    const result = await Patient.getUtilisateurs();

    // Respond with the list of archived utilisateurs
    res.status(200).json({ utilisateurs: result });
    console.log("utilisateurs:", result);
  } catch (error) {
    console.error("❌ Error fetching archived utilisateurs:", error);
    res.status(500).json({ error: error.toString() });
  }
};
// ✅ modified to be compatible with new directeur strecture
exports.getUtilisateur = async (req, res) => {
  const { email } = req.params;

  try {
    let rawUser = null;

    // Try to find active user
    const result = await Patient.findUserByEmail(email);

    if (result) {
      result.isActif = true;
      const userId = result.id;

      const patient = await Patient.findPatientByUtilisateurId(userId);
      if (patient) {
        result.photo = patient.photo;
        result.nom = patient.nom;
        result.prenom = patient.prenom;
        result.date_naissance = patient.date_naissance;
      }

      rawUser = result;
    } else {
      // Try to find archived user
      const archived = await Patient.findUserByEmailArchived(email);
      if (archived) {
        archived.isActif = false;
        const userId = archived.id;

        const patient = await Patient.findPatientByUtilisateurIdArchived(
          userId
        );
        if (patient) {
          archived.photo = patient.photo;
          archived.nom = patient.nom;
          archived.prenom = patient.prenom;
          archived.date_naissance = patient.date_naissance;
        } else {
          const directeur = await Patient.findDirecteurByUtilisateurIdArchived(
            userId
          );
          if (directeur) {
            archived.photo = directeur.photo;
            archived.nom = directeur.nom;
            archived.prenom = directeur.prenom;
            archived.date_naissance = directeur.date_naissance;
          }
        }

        rawUser = archived;
      }
    }

    if (rawUser) {
      const utilisateur = {
        id: rawUser.id,
        email: rawUser.email,
        isActif: rawUser.isActif,
        nom: rawUser.nom,
        prenom: rawUser.prenom,
        photo: rawUser.photo,
        date_naissance: rawUser.date_naissance
          ? new Date(rawUser.date_naissance).toISOString().split("T")[0] // → "YYYY-MM-DD"
          : null,
      };

      res.status(200).json({ utilisateur });
    } else {
      res.status(404).json({ error: "Utilisateur not found" });
    }
  } catch (error) {
    console.error("❌ Error fetching utilisateur:", error);
    res.status(500).json({ error: error.toString() });
  }
};
