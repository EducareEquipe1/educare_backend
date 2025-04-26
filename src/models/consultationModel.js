const connection = require("../db");


exports.createExamenMedical = async (data) => {
  return new Promise((resolve, reject) => {
    const checkConsultationSql = `
      SELECT 1 FROM Consultation WHERE id_consultation = ?
    `;
    const checkExamenSql = `
      SELECT 1 FROM Examen_Medical WHERE consultation_id = ?
    `;
    const insertSql = `
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

    // Step 1: Check if consultation exists
    connection.query(checkConsultationSql, [data.consultation_id], (err1, consultationRows) => {
      if (err1) {
        return reject("❌ Error checking consultation: " + err1);
      }
      if (consultationRows.length === 0) {
        return reject("⚠️ Consultation not found. Cannot create examen médical.");
      }

      // Step 2: Check if examen médical already exists
      connection.query(checkExamenSql, [data.consultation_id], (err2, examenRows) => {
        if (err2) {
          return reject("❌ Error checking existing examen médical: " + err2);
        }
        if (examenRows.length > 0) {
          return reject({
            code: "EXISTING_EXAM",
            message: "This consultation already has an examen médical.",
          });
        }

        // Step 3: Insert new Examen_Medical
        connection.query(insertSql, values, (err3, result) => {
          if (err3) {
            return reject("❌ Error inserting examen médical: " + err3);
          }
          resolve({ message: "✅ Examen médical created successfully", id: result.insertId });
        });
      });
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
    const checkSql = `
      SELECT 1 FROM Ordonnance WHERE consultation_id = ?
    `;
    const insertSql = `
      INSERT INTO Ordonnance (date, consultation_id)
      VALUES (?, ?)
    `;

    const { date, consultation_id } = data;

    // Step 1: Check if an ordonnance already exists for this consultation
    connection.query(checkSql, [consultation_id], (err, existingOrdonnances) => {
      if (err) {
        return reject("❌ Error checking existing ordonnance: " + err);
      }

      if (existingOrdonnances.length > 0) {
        return reject("⚠️ Ordonnance already exists for this consultation.");
      }

      // Step 2: If not found, insert the new ordonnance
      connection.query(insertSql, [date, consultation_id], (insertErr, result) => {
        if (insertErr) {
          return reject("❌ Error creating ordonnance: " + insertErr);
        }

        resolve({
          message: "✅ Ordonnance created successfully",
          id_ordonnance: result.insertId,
        });
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
    connection.query(checkOrdonnanceSql, [data.id_ordonnance], (err1, ordRows) => {
      if (err1) return reject("❌ Error checking ordonnance: " + err1);
      if (ordRows.length === 0) return reject("❌ Ordonnance not found.");

      // Step 2: Check if medicament exists
      connection.query(checkMedicamentSql, [data.medicament_id], (err2, medRows) => {
        if (err2) return reject("❌ Error checking medicament: " + err2);
        if (medRows.length === 0) return reject("❌ Medicament not found.");

        // Step 3: Check for duplicate
        connection.query(checkDuplicateSql, [data.id_ordonnance, data.medicament_id], (err3, dupRows) => {
          if (err3) return reject("❌ Error checking duplicate entry: " + err3);
          if (dupRows.length > 0) return reject("⚠️ Medicament already exists in this ordonnance.");

          connection.query(insertSql, [data.id_ordonnance, data.medicament_id, data.duree], (err4, result) => {
            if (err4) return reject("❌ Error adding medicament to ordonnance: " + err4);

            resolve({
              message: "✅ Medicament added to ordonnance successfully",
              ordonnance_id: data.id_ordonnance,
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

/**
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


exports.deleteMedicamentsByOrdonnance = async (ordonnance_id) => {
  console.log("🗑️ Attempting to delete medicaments for ordonnance_id:", ordonnance_id);

  return new Promise((resolve, reject) => {
    const checkMedicamentsSql = `
      SELECT 1 FROM MedicamentsInOrdonnance
      WHERE ordonnance_id = ?
    `;
    const deleteMedicamentsSql = `
      DELETE FROM MedicamentsInOrdonnance
      WHERE ordonnance_id = ?
    `;

    // Step 1: Check if there are medicaments for this ordonnance
    connection.query(checkMedicamentsSql, [ordonnance_id], (err1, results) => {
      if (err1) {
        console.error("❌ Error checking medicaments:", err1);
        return reject("❌ Error checking medicaments: " + err1);
      }

      if (results.length === 0) {
        console.log("ℹ️ No medicaments found for this ordonnance.");
        return resolve({ message: "ℹ️ No medicaments to delete for this ordonnance." });
      }

      // Step 2: Delete medicaments
      connection.query(deleteMedicamentsSql, [ordonnance_id], (err2, deleteResult) => {
        if (err2) {
          console.error("❌ Error deleting medicaments:", err2);
          return reject("❌ Error deleting medicaments: " + err2);
        }

        console.log(`✅ Deleted ${deleteResult.affectedRows} medicament(s) from ordonnance_id: ${ordonnance_id}`);
        resolve({
          message: `✅ ${deleteResult.affectedRows} medicament(s) deleted successfully.`,
        });
      });
    });
  });
};


exports.deleteOrdonnance = async (ordonnance_id) => {
  console.log("🗑️ Starting deletion of ordonnance_id:", ordonnance_id);

  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        console.error("❌ Transaction error:", err);
        return reject("❌ Transaction error: " + err);
      }

      // Step 1: Delete medicaments first
      exports.deleteMedicamentsByOrdonnance(ordonnance_id)
        .then(() => {
          const checkOrdonnanceSql = `
            SELECT 1 FROM Ordonnance
            WHERE id_ordonnance = ?
          `;
          const deleteOrdonnanceSql = `
            DELETE FROM Ordonnance
            WHERE id_ordonnance = ?
          `;

          // Step 2: Check if ordonnance exists
          connection.query(checkOrdonnanceSql, [ordonnance_id], (err2, ordonnanceRows) => {
            if (err2) {
              console.error("❌ Error checking ordonnance:", err2);
              return connection.rollback(() => reject("❌ Error checking ordonnance: " + err2));
            }

            if (ordonnanceRows.length === 0) {
              console.log("ℹ️ Ordonnance already deleted or does not exist.");
              return connection.rollback(() => reject("ℹ️ Ordonnance already deleted or does not exist."));
            }

            // Step 3: Delete ordonnance
            connection.query(deleteOrdonnanceSql, [ordonnance_id], (err3, deleteResult) => {
              if (err3) {
                console.error("❌ Error deleting ordonnance:", err3);
                return connection.rollback(() => reject("❌ Error deleting ordonnance: " + err3));
              }

              console.log(`✅ Deleted ordonnance with id: ${ordonnance_id}`);

              // Step 4: Commit
              connection.commit((commitErr) => {
                if (commitErr) {
                  console.error("❌ Commit error:", commitErr);
                  return connection.rollback(() => reject("❌ Commit error: " + commitErr));
                }
                resolve({ message: "✅ Ordonnance and related medicaments deleted successfully" });
              });
            });
          });
        })
        .catch((err) => {
          console.error("❌ Error during deletion process:", err);
          connection.rollback(() => reject(err));
        });
    });
  });
};
exports.deleteConsultation = async (consultation_id) => {
  console.log("🗑️ Starting full deletion of consultation_id:", consultation_id);

  return new Promise((resolve, reject) => {
    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("❌ Transaction error:", err);
        return reject("❌ Transaction error: " + err);
      }

      try {
        // Step 1: Delete Examen_Medical if exists
        const deleteExamenMedicalSql = `
          DELETE FROM Examen_Medical
          WHERE consultation_id = ?
        `;

        connection.query(deleteExamenMedicalSql, [consultation_id], (deleteExamErr, deleteExamResult) => {
          if (deleteExamErr) {
            console.error("❌ Error deleting examen medical:", deleteExamErr);
            return connection.rollback(() => reject("❌ Error deleting examen medical: " + deleteExamErr));
          }

          console.log(`🧹 Deleted ${deleteExamResult.affectedRows} Examen_Medical record(s)`);

          // Step 2: Check if an Ordonnance exists for this Consultation
          const checkOrdonnanceSql = `
            SELECT id_ordonnance 
            FROM Ordonnance 
            WHERE consultation_id = ?
          `;

          connection.query(checkOrdonnanceSql, [consultation_id], async (checkErr, ordonnanceRows) => {
            if (checkErr) {
              console.error("❌ Error checking ordonnance:", checkErr);
              return connection.rollback(() => reject("❌ Error checking ordonnance: " + checkErr));
            }

            if (ordonnanceRows.length > 0) {
              const ordonnanceId = ordonnanceRows[0].id_ordonnance;
              console.log("📄 Found ordonnance for consultation. Deleting ordonnance_id:", ordonnanceId);

              // Step 3: Delete the ordonnance (and its medicaments)
              try {
                await exports.deleteOrdonnance(ordonnanceId);
              } catch (deleteOrdonnanceErr) {
                console.error("❌ Error deleting ordonnance:", deleteOrdonnanceErr);
                return connection.rollback(() => reject(deleteOrdonnanceErr));
              }
            } else {
              console.log("ℹ️ No ordonnance linked to this consultation.");
            }

            // Step 4: Delete the Consultation
            const deleteConsultationSql = `
              DELETE FROM Consultation
              WHERE id_consultation = ?
            `;
            connection.query(deleteConsultationSql, [consultation_id], (deleteConsultErr, deleteConsultResult) => {
              if (deleteConsultErr) {
                console.error("❌ Error deleting consultation:", deleteConsultErr);
                return connection.rollback(() => reject("❌ Error deleting consultation: " + deleteConsultErr));
              }

              console.log(`✅ Deleted consultation with id: ${consultation_id}`);

              // Step 5: Commit the transaction
              connection.commit((commitErr) => {
                if (commitErr) {
                  console.error("❌ Commit error:", commitErr);
                  return connection.rollback(() => reject("❌ Commit error: " + commitErr));
                }
                resolve({ message: "✅ Consultation, Examen_Medical, and related ordonnance deleted successfully." });
              });
            });
          });
        });
      } catch (error) {
        console.error("❌ Unexpected error:", error);
        connection.rollback(() => reject(error));
      }
    });
  });
};

