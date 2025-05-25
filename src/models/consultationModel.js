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

    connection.query(
      checkConsultationSql,
      [data.consultation_id],
      (err1, consultationRows) => {
        if (err1) return reject("❌ Error checking consultation: " + err1);
        if (consultationRows.length === 0) {
          return resolve({
            success: false,
            message: "⚠️ Consultation not found.",
          });
        }

        connection.query(
          checkExamenSql,
          [data.consultation_id],
          (err2, examenRows) => {
            if (err2)
              return reject(
                "❌ Error checking existing examen médical: " + err2
              );
            if (examenRows.length > 0) {
              return resolve({
                success: false,
                message:
                  "⚠️ Examen médical already exists for this consultation.",
              });
            }

            connection.query(insertSql, values, (err3, result) => {
              if (err3)
                return reject("❌ Error inserting examen médical: " + err3);
              resolve({
                success: true,
                message: "✅ Examen médical created successfully",
                id: result.insertId,
              });
            });
          }
        );
      }
    );
  });
};

exports.createConsultation = async (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Consultation (
        patient_id, \`date\`, \`type\`, symptomes, observations, diagnostic, piece, motif, id_rendezVous
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.patient_id,
      data.date,
      data.type,
      data.symptomes,
      data.observations,
      data.diagnostic,
      data.piece,
      data.motif,
      data.id_rendezVous ?? null,
    ];

    connection.query(sql, values, (err, result) => {
      if (err) return reject("❌ Error creating consultation: " + err.message);
      resolve({
        success: true,
        message: "✅ Consultation created successfully",
        id_consultation: result.insertId,
      });
    });
  });
};

exports.ModifyConsultation = (id_consultation, data) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(`\`${key}\` = ?`);
      values.push(value);
    }

    values.push(id_consultation); // for WHERE clause

    const sql = `
      UPDATE Consultation
      SET ${fields.join(", ")}
      WHERE id_consultation = ?
    `;

    connection.query(sql, values, (err, result) => {
      if (err) return reject("❌ Error updating consultation: " + err.message);
      if (result.affectedRows === 0) {
        return resolve({
          success: false,
          message: "⚠️ Consultation not found to update.",
        });
      }
      resolve({
        success: true,
        message: "✅ Consultation updated successfully",
      });
    });
  });
};

exports.createOrdonnance = async (data) => {
  return new Promise((resolve, reject) => {
    const checkSql = "SELECT 1 FROM Ordonnance WHERE consultation_id = ?";
    const insertSql =
      "INSERT INTO Ordonnance (date, consultation_id) VALUES (?, ?)";

    const { date, consultation_id } = data;

    connection.query(
      checkSql,
      [consultation_id],
      (err, existingOrdonnances) => {
        if (err) return reject("❌ Error checking existing ordonnance: " + err);
        if (existingOrdonnances.length > 0) {
          return resolve({
            success: false,
            message: "⚠️ Ordonnance already exists for this consultation.",
          });
        }

        connection.query(
          insertSql,
          [date, consultation_id],
          (insertErr, result) => {
            if (insertErr)
              return reject("❌ Error creating ordonnance: " + insertErr);
            resolve({
              success: true,
              message: "✅ Ordonnance created successfully",
              id_ordonnance: result.insertId,
            });
          }
        );
      }
    );
  });
};

exports.addMedicamentsToOrdonnance = async (data) => {
  return new Promise((resolve, reject) => {
    const checkOrdonnanceSql =
      "SELECT 1 FROM Ordonnance WHERE id_ordonnance = ?";
    const checkMedicamentSql = "SELECT 1 FROM medicaments WHERE ID = ?";
    const checkDuplicateSql = `
      SELECT 1 FROM MedicamentsInOrdonnance WHERE ordonnance_id = ? AND medicament_id = ?
    `;
    const insertSql = `
      INSERT INTO MedicamentsInOrdonnance (ordonnance_id, medicament_id, duree)
      VALUES (?, ?, ?)
    `;

    connection.query(
      checkOrdonnanceSql,
      [data.id_ordonnance],
      (err1, ordRows) => {
        if (err1) return reject("❌ Error checking ordonnance: " + err1);
        if (ordRows.length === 0) {
          return resolve({
            success: false,
            message: "⚠️ Ordonnance not found.",
          });
        }

        connection.query(
          checkMedicamentSql,
          [data.medicament_id],
          (err2, medRows) => {
            if (err2) return reject("❌ Error checking medicament: " + err2);
            if (medRows.length === 0) {
              return resolve({
                success: false,
                message: "⚠️ Medicament not found.",
              });
            }

            connection.query(
              checkDuplicateSql,
              [data.id_ordonnance, data.medicament_id],
              (err3, dupRows) => {
                if (err3) return reject("❌ Error checking duplicate: " + err3);
                if (dupRows.length > 0) {
                  return resolve({
                    success: false,
                    message: "⚠️ Medicament already added to ordonnance.",
                  });
                }

                connection.query(
                  insertSql,
                  [data.id_ordonnance, data.medicament_id, data.duree],
                  (err4, result) => {
                    if (err4)
                      return reject("❌ Error adding medicament: " + err4);

                    resolve({
                      success: true,
                      message: "✅ Medicament added to ordonnance.",
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
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
      if (err) return reject("❌ Error fetching consultations: " + err);
      resolve(results);
    });
  });
};

exports.getConsultationId = async (id_consultation) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM Consultation
      WHERE id_consultation = ?
      
    `;

    connection.query(sql, [id_consultation], (err, results) => {
      if (err) return reject("❌ Error fetching consultations: " + err);
      resolve(results);
    });
  });
};

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
      FROM MedicamentsInOrdonnance mio
      JOIN medicaments m ON m.ID = mio.medicament_id
      JOIN Ordonnance o ON o.id_ordonnance = mio.ordonnance_id
      WHERE mio.ordonnance_id = ?
    `;

    connection.query(sql, [ordonnanceId], (err, results) => {
      if (err) return reject("❌ Error fetching medicaments: " + err);
      resolve(results);
    });
  });
};
exports.deleteConsultation = async (id_consultation) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM Consultation
      WHERE id_consultation = ?
    `;

    connection.query(sql, [id_consultation], (err, results) => {
      if (err) return reject("❌ Error deleting consultation: " + err);

      // Check if any rows were affected (i.e., if any consultation was deleted)
      if (results.affectedRows > 0) {
        resolve({ success: "Consultation deleted successfully" });
      } else {
        resolve({ error: "Consultation not found" });
      }
    });
  });
};
exports.hasOrdonnanceForConsultation = async (consultation_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 1 FROM Ordonnance WHERE consultation_id = ?
    `;

    connection.query(sql, [consultation_id], (err, results) => {
      if (err) return reject("❌ Error checking ordonnance: " + err);

      if (results.length > 0) {
        resolve({
          exists: true,
          message: "✅ Ordonnance exists for this consultation.",
        });
      } else {
        resolve({
          exists: false,
          message: "⚠️ No ordonnance found for this consultation.",
        });
      }
    });
  });
};
exports.getMedicamentsByConsultationId = async (consultation_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        mio.medicament_id,
        mio.duree,
        m.nom_de_marque,
        m.forme,
        m.dosage,
        m.cond
      FROM MedicamentsInOrdonnance mio
      JOIN Ordonnance o ON o.id_ordonnance = mio.ordonnance_id
      JOIN medicaments m ON m.id = mio.medicament_id
      WHERE o.consultation_id = ?
    `;

    connection.query(sql, [consultation_id], (err, results) => {
      if (err)
        return reject("❌ Error fetching medicaments by consultation: " + err);

      if (results.length === 0) {
        return resolve({
          success: false,
          message: "⚠️ No medicaments found for this consultation.",
          medicaments: [],
        });
      }

      resolve({
        success: true,
        message: "✅ Medicaments fetched successfully.",
        medicaments: results,
      });
    });
  });
};
exports.hasExamenForConsultation = async (consultation_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 1 FROM Examen_Medical WHERE consultation_id = ?
    `;

    connection.query(sql, [consultation_id], (err, results) => {
      if (err) return reject("❌ Error checking examen medical: " + err);

      if (results.length > 0) {
        resolve({
          exists: true,
          message: "✅ examen medical  exists for this consultation.",
        });
      } else {
        resolve({
          exists: false,
          message: "⚠️ No examen medical found for this consultation.",
        });
      }
    });
  });
};
exports.getExamenMedical = async (consultation_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id,
        consultation_id,
        poids,
        taille,
        IMC,
        tension,
        vision_d,
        vision_g,
        larmoiement,
        douleurs,
        taches_yeux,
        audition_d,
        audition_g,
        sifflements,
        angines,
        epistaxis,
        rhinorrhee,
        cephalies,
        vertiges,
        troubles_sommeil,
        peau_normal,
        peau_anormale,
        douleurs_musculaires,
        douleurs_articulaires,
        douleurs_neurologiques,
        toux,
        dyspnee,
        douleurs_thoraciques,
        palpitations,
        oedemes,
        cyanose,
        pyrosis,
        vomissements,
        douleurs_abdominales,
        dysurie,
        hematurie,
        cycles_irreguliers,
        fonction_respiratoire,
        fonction_circulatoire,
        fonction_motrice,
        sanguins,
        urinaires,
        radiologiques,
        hepatites_pos,
        hepatites_neg,
        syphilis_pos,
        syphilis_neg,
        vih_pos,
        vih_neg
      FROM Examen_Medical
      WHERE consultation_id = ?
      LIMIT 1
    `;

    connection.query(sql, [consultation_id], (err, results) => {
      if (err) return reject("❌ Error retrieving examen medical: " + err);

      if (results.length === 0) {
        resolve(null); // no exam found
      } else {
        resolve(results[0]); // return the exam record
      }
    });
  });
};
