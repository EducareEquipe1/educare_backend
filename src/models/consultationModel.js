const connection = require("../db");

exports.createExamenMedical = async (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
        INSERT INTO Examen_Medical (
        consultation_id, poids, taille, IMC, tension, vision_d, vision_g,
          larmoiement, douleurs, taches_yeux, audition_d, audition_g, sifflements,
          angines, epistaxis, rhinorrhee, cephalies, vertiges, troubles_sommeil,
          peau_normal, peau_anormale, douleurs_musculaires, douleurs_articulaires,
          douleurs_neurologiques, toux, dyspnee, douleurs_thoraciques, palpitations,
          oedemes, cyanose, pyrosis, vomissements, douleurs_abdominales, dysurie,
          hematurie, cycles_irreguliers, fonction_respiratoire, fonction_circulatoire,
          fonction_motrice, sanguins, urinaires, radiologiques, hepatites_pos,
          hepatites_neg, syphilis_pos, syphilis_neg, vih_pos, vih_neg
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
      `;

    const values = [
      data.consultation_id,
      data.poids,
      data.taille,
      data.IMC,
      data.tension,
      data.vision_d,
      data.vision_g,
      data.larmoiement,
      data.douleurs,
      data.taches_yeux,
      data.audition_d,
      data.audition_g,
      data.sifflements,
      data.angines,
      data.epistaxis,
      data.rhinorrhee,
      data.cephalies,
      data.vertiges,
      data.troubles_sommeil,
      data.peau_normal,
      data.peau_anormale,
      data.douleurs_musculaires,
      data.douleurs_articulaires,
      data.douleurs_neurologiques,
      data.toux,
      data.dyspnee,
      data.douleurs_thoraciques,
      data.palpitations,
      data.oedemes,
      data.cyanose,
      data.pyrosis,
      data.vomissements,
      data.douleurs_abdominales,
      data.dysurie,
      data.hematurie,
      data.cycles_irreguliers,
      data.fonction_respiratoire,
      data.fonction_circulatoire,
      data.fonction_motrice,
      data.sanguins,
      data.urinaires,
      data.radiologiques,
      data.hepatites_pos,
      data.hepatites_neg,
      data.syphilis_pos,
      data.syphilis_neg,
      data.vih_pos,
      data.vih_neg,
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve({ message: "Examen Medical created", id: result.insertId });
      }
    });
  });
};

exports.createConsultation = async (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Consultation (
        patient_id,
        \`date\`,
        \`type\`,
        symptomes,
        observations,
        diagnostic,
        piece,
        motif,
        id_rendezVous
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.patient_id,
      data.date, // should be string like "2025-04-25"
      data.type,
      data.symptomes,
      data.observations,
      data.diagnostic,
      data.piece,
      data.motif,
      data.id_rendezVous ?? null, // if optional, use null fallback
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        return reject("❌ Error creating consultation: " + err.message);
      }
      resolve({
        message: "✅ Consultation created successfully",
        id_consultation: result.insertId,
      });
    });
  });
};
exports.ModifyConsultation = async (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Consultation
      SET 
        \`date\` = ?,
        \`type\` = ?,
        symptomes = ?,
        observations = ?,
        diagnostic = ?,
        piece = ?,
        motif = ?,
        id_rendezVous = ?
      WHERE id_consultation = ?
    `;

    const values = [
      data.date,
      data.type,
      data.symptomes,
      data.observations,
      data.diagnostic,
      data.piece,
      data.motif,
      data.id_rendezVous ?? null,
      data.id_consultation, // ✅ Ensure the consultation ID is included
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        return reject("❌ Error updating consultation: " + err.message);
      }
      resolve({
        message: "✅ Consultation updated successfully",
        affectedRows: result.affectedRows, // Number of updated rows
      });
    });
  });
};
exports.createOrdonnance = async (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Ordonnance (date, consultation_id)
      VALUES (?, ?)
    `;

    const values = [data.date, data.consultation_id];

    connection.query(sql, values, (err, result) => {
      if (err) {
        return reject("❌ Error creating ordonnance: " + err);
      }

      resolve({
        message: "✅ Ordonnance created successfully",
        id_ordonnance: result.insertId,
      });
    });
  });
};
exports.addMedicaments = async (data) => {
  return new Promise((resolve, reject) => {
    const checkOrdonnanceSql = "SELECT 1 FROM Ordonnance WHERE id_ordonnance = ?";
    const checkMedicamentSql = "SELECT 1 FROM medicaments WHERE ID = ?";
    const checkDuplicateSql = `
      SELECT 1 FROM MedicamentsInOrdonnance 
      WHERE ordonnance_id = ? AND medicament_id = ?
    `;
    const insertSql = `
      INSERT INTO MedicamentsInOrdonnance (ordonnance_id, medicament_id, duree)
      VALUES (?, ?, ?)
    `;

    // Step 1: Check if ordonnance exists
    connection.query(checkOrdonnanceSql, [data.id_ordenance], (err1, ordRows) => {
      if (err1) return reject("❌ Error checking ordonnance: " + err1);
      if (ordRows.length === 0) return reject("❌ Ordonnance not found.");

      // Step 2: Check if medicament exists
      connection.query(checkMedicamentSql, [data.medicament_id], (err2, medRows) => {
        if (err2) return reject("❌ Error checking medicament: " + err2);
        if (medRows.length === 0) return reject("❌ Medicament not found.");

        // Step 3: Check for duplicate
        connection.query(checkDuplicateSql, [data.id_ordenance, data.medicament_id], (err3, dupRows) => {
          if (err3) return reject("❌ Error checking duplicate entry: " + err3);
          if (dupRows.length > 0) return reject("⚠️ Medicament already exists in this ordonnance.");

          // Step 4: Insert new record
          connection.query(insertSql, [data.id_ordenance, data.medicament_id, data.duree], (err4, result) => {
            if (err4) return reject("❌ Error adding medicament to ordonnance: " + err4);

            resolve({
              message: "✅ Medicament added to ordonnance successfully",
              ordonnance_id: data.id_ordenance,
              medicament_id: data.medicament_id,
            });
          });
        });
      });
    });
  });
};
exports.getConsultationsByPatientId = async (patient_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM Consultation
      WHERE patient_id = ?
      ORDER BY date DESC
    `;

    connection.query(sql, [patient_id], (err, results) => {
      if (err) {
        return reject("❌ Error fetching consultations: " + err);
      }
      resolve(results);
    });
  });
};
// --- model/Ordonnance.js ---

/**
 * Fetch all medicaments (with their details and prescribed duration)
 * for a specific ordonnance.
 *
 * @param {number} ordonnanceId
 * @returns {Promise<Array<{ medicament_id: number, duree: string, ID: number, NOM_DE_MARQUE: string, FORM: string, ... }>>}
 */
exports.getMedicamentsByOrdonnance = (ordonnanceId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mio.medicament_id,
        mio.duree,
        m.ID,
        m.NOM_DE_MARQUE,
        m.FORME,
        m.DOSAGE,
        m.COND,
        o.date AS ordonnance_date
      FROM MedicamentsInOrdonnance AS mio
      JOIN medicaments AS m ON mio.medicament_id = m.ID
      JOIN Ordonnance AS o ON mio.ordonnance_id = o.id_ordonnance
      WHERE mio.ordonnance_id = ?
    `;
    connection.query(sql, [ordonnanceId], (err, rows) => {
      if (err) return reject("❌ Error fetching medicaments for ordonnance: " + err);
      resolve(rows);
    });
  });
};


// models/ordonnance.js

// models/ordonnance.js

exports.deleteMedicamentsByOrdonnance = (ordonnanceId) => {
  return new Promise((resolve, reject) => {
    console.log("📝 Deleting medicaments associated with ordonnance_id:", ordonnanceId);

    const sql = `
      DELETE FROM MedicamentsInOrdonnance
      WHERE ordonnance_id = ?
    `;

    const values = [ordonnanceId];  // Ensure you're passing a single value

    console.log("▶️ SQL: ", sql);
    console.log("▶️ Values: ", values);

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ Error deleting medicaments:", err);
        return reject("❌ Error deleting medicaments: " + err.message);
      }

      console.log(`🗑  Deleted ${result.affectedRows} medicament(s)`);
      resolve(result);
    });
  });
};

exports.deleteOrdonnance = (ordonnanceId) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) return reject("❌ Transaction error: " + err);

      // First, delete medicaments linked to this ordonnance
      exports.deleteMedicamentsByOrdonnance(ordonnanceId)
        .then(() => {
          const deleteOrdSql = `
            DELETE FROM Ordonnance
            WHERE id_ordonnance = ?
          `;
          const values = [ordonnanceId];
          
          console.log("▶️ SQL for Ordonnance delete: ", deleteOrdSql);
          console.log("▶️ Values for Ordonnance delete: ", values);

          connection.query(deleteOrdSql, values, (err2, result2) => {
            if (err2) {
              return connection.rollback(() => reject("❌ Error deleting ordonnance: " + err2));
            }
            console.log(`🗑  Deleted ${result2.affectedRows} ordonnance(s)`);

            // Commit after both deletions
            connection.commit((err3) => {
              if (err3) {
                return connection.rollback(() => reject("❌ Commit error: " + err3));
              }
              resolve({ message: "✅ Ordonnance and related medicaments deleted successfully" });
            });
          });
        })
        .catch((err) => {
          connection.rollback(() => reject(err));
        });
    });
  });
};



