const connection = require("../db");

exports.hasMaladieForPatientm = async (id_patient) => {
  return new Promise((resolve, reject) => {
    if (!id_patient || isNaN(id_patient)) {
      return reject("❌ Invalid patient ID provided.");
    }

    const sql = `
      SELECT 1 FROM Patient_Maladie WHERE id_patient = ?
    `;

    connection.query(sql, [id_patient], (err, results) => {
      if (err) return reject("❌ Error checking patient maladie: " + err);

      if (results.length > 0) {
        resolve({
          exists: true,
          message: "✅ Maladie record(s) exist for this patient.",
        });
      } else {
        resolve({
          exists: false,
          message: "⚠️ No maladie records found for this patient.",
        });
      }
    });
  });
};

exports.getMaladiesForPatientm = async (id_patient) => {
  return new Promise((resolve, reject) => {
    if (!id_patient || isNaN(id_patient)) {
      return reject("❌ Invalid patient ID provided.");
    }

    const sql = `
      SELECT 
        m.id AS maladie_id,
        m.nom,
        m.type,
        pm.date_diagnostic
      FROM Patient_Maladie pm
      JOIN Maladie m ON pm.id_maladie = m.id
      WHERE pm.id_patient = ?
    `;

    connection.query(sql, [id_patient], (err, results) => {
      if (err) return reject("❌ Error retrieving maladies for patient: " + err);

      resolve(results); // could be an empty array if no maladies
    });
  });
};
