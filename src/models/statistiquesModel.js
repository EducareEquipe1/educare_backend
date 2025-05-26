const connection = require("../db");
const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
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


exports.lierMaladieAuPatient = async (email, id_maladie, date_diagnostic = null) => {
  if (!email || !id_maladie) {
    throw new Error("❌ Email et ID de maladie sont requis.");
  }

  // 1. Récupérer l'ID du patient à partir de son email
  const result = await sequelize.query(
    `
    SELECT p.id AS patient_id
    FROM Patient p
    JOIN Utilisateur u ON p.utilisateur_id = u.id
    WHERE u.email = ?
    `,
    {
      replacements: [email],
      type: QueryTypes.SELECT,
    }
  );

  if (result.length === 0) {
    throw new Error("❌ Aucun patient trouvé avec cet e-mail.");
  }

  const id_patient = result[0].patient_id;

  // 2. Insérer dans Patient_Maladie
  await sequelize.query(
    `
    INSERT INTO Patient_Maladie (id_patient, id_maladie, date_diagnostic)
    VALUES (?, ?, ?)
    `,
    {
      replacements: [id_patient, id_maladie, date_diagnostic || new Date()],
      type: QueryTypes.INSERT,
    }
  );

  return { message: "✅ Maladie liée au patient avec succès." };
};






