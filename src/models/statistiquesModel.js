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




exports.getConsultationsParMoisByYear = async (year) => {
  return new Promise((resolve, reject) => {
    if (!year || isNaN(year)) {
      return reject("❌ Invalid year provided.");
    }

    // Start = septembre de l'année précédente, End = mai de l'année sélectionnée
    const startDate = `${year - 1}-09-01`;
    const endDate = `${year}-05-31`;

    const sql = `
      SELECT 
        MONTH(date) AS mois,
        COUNT(*) AS total
      FROM Consultation
      WHERE date BETWEEN ? AND ?
      GROUP BY mois
      ORDER BY mois ASC
    `;

    connection.query(sql, [startDate, endDate], (err, results) => {
      if (err) return reject("❌ Error retrieving consultations: " + err);

      const moisFr = [
        "janvier", "fevrier", "mars", "avril", "mai",
        "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"
      ];

      // Créer tableau vide de septembre à mai (ordre logique scolaire)
      const moisOrdre = [9, 10, 11, 12, 1, 2, 3, 4, 5]; // mois de septembre à mai
      const result = moisOrdre.map((mois) => ({
        name: moisFr[mois - 1],
        value: 0,
      }));

      results.forEach(({ mois, total }) => {
        const index = moisOrdre.indexOf(mois);
        if (index !== -1) {
          result[index].value = total;
        }
      });

      resolve(result);
    });
  });
};



// models/Consultation.js


