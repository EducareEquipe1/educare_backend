const { getArchivedUtilisateurs } = require("../models/archiveModel");
// ✅ Register Patient
const { transferUtilisateur } = require("../models/archiveModel");
const { restoreUtilisateur } = require("../models/archiveModel");

exports.archiveUtilisateur = async (req, res) => {
  try {
    const email = req.params.email;
    if (email === "ni.merzouk@esi-sba.dz") {
      res.status(400).json({ error: "you cant archive the admin" });
    }
    const result = await transferUtilisateur(email);
    res.status(200).json({ message: result });
    console.log("email is ", email);
    console.log("result is ", result);
  } catch (error) {
    console.error("❌ Error archiving user:", error);
    res.status(500).json({ error: error.toString() });
  }
};

exports.restoreUtilisateur = async (req, res) => {
  try {
    const email = req.params.email;

    // Ensure email is valid
    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({ error: "❌ Invalid email format" });
    }

    // Call the actual restore function (renamed to prevent conflict)
    const result = await restoreUtilisateur(email);
    res.status(200).json({ message: result });

    console.log("email is ", email);
    console.log("result is ", result);
  } catch (error) {
    console.error("❌ Error restoring user:", error);
    res.status(500).json({ error: error.toString() });
  }
};



exports.archiveDossierMedicalController = async (req, res) => {
  const { patientId } = req.params;

  try {
    const result = await dossierService.transferDossierMedical(patientId);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};


exports.getArchivedUtilisateurs = async (req, res) => {
  try {
    // Fetch archived utilisateurs from the model
    const result = await getArchivedUtilisateurs();

    // Respond with the list of archived utilisateurs
    res.status(200).json({ utilisateurs: result });
    console.log("Archived utilisateurs:", result);
  } catch (error) {
    console.error("❌ Error fetching archived utilisateurs:", error);
    res.status(500).json({ error: error.toString() });
  }
};

