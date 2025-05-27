const connection = require("../db.js");
const connectionArchive = require("../archiveDb.js");
const Patient = require("../models/authPatientModel");
const { deleteConsultation } = require("./consultationModel.js");
const { queryPromise } = require("../utils.js"); // helper added

const checkAndArchiveDirecteur = (patientId) => {
  return new Promise((resolve, reject) => {
    const selectSql = `SELECT * FROM Directeur WHERE patient_id = ?`;
    connection.query(selectSql, [patientId], (err, results) => {
      if (err) return reject("❌ Error checking Directeur: " + err);
      if (results.length === 0) return resolve("No Directeur found.");

      const directeur = results[0];

      const insertSql = `INSERT INTO archive.Directeur (id, patient_id) VALUES (?, ?)`;
      const params = [directeur.id, directeur.patient_id];

      connectionArchive.query(insertSql, params, (insertErr) => {
        if (insertErr)
          return reject("❌ Error archiving Directeur: " + insertErr);

        const deleteSql = `DELETE FROM Directeur WHERE id = ?`;
        connection.query(deleteSql, [directeur.id], (deleteErr) => {
          if (deleteErr)
            return reject("❌ Error deleting Directeur: " + deleteErr);
          resolve("✅ Directeur archived and deleted.");
        });
      });
    });
  });
};

const handleDossierTransfer = (ownerId) => {
  return new Promise((resolve, reject) => {
    const dossierQuery =
      "SELECT * FROM Dossier_Medical WHERE utilisateur_id = ?";
    connection.query(dossierQuery, [ownerId], (err, results) => {
      if (err) return reject("❌ Error fetching Dossier_Medical: " + err);
      if (results.length === 0) {
        console.log(`ℹ️ No Dossier_Medical found for user ${ownerId}`);
        return resolve();
      }

      const dossier = results[0];

      const insertSql = `
        INSERT INTO archive.Dossier_Medical 
        (id, date_creation, groupeSanguin, numSecuriteSociale, adresse, situation_famille,
        taille, poids, tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre,
        tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, periode_exposition, alcool,
        medicaments, affectionsCongenitales, maladiesGenerales, interventionsChirurgicales,
        reactionsAllergiques, notes, statut, date_naissance, nom, prenom, num_tel, utilisateur_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      connectionArchive.query(
        insertSql,
        [
          dossier.id,
          dossier.date_creation,
          dossier.groupeSanguin,
          dossier.numSecuriteSociale,
          dossier.adresse,
          dossier.situation_famille,
          dossier.taille,
          dossier.poids,
          dossier.tabac_fume,
          dossier.tabac_fume_nombre,
          dossier.tabac_chique,
          dossier.tabac_chique_nombre,
          dossier.tabac_pris,
          dossier.tabac_pris_nombre,
          dossier.age_pris,
          dossier.ancien_fume,
          dossier.periode_exposition,
          dossier.alcool,
          dossier.medicaments,
          dossier.affectionsCongenitales,
          dossier.maladiesGenerales,
          dossier.interventionsChirurgicales,
          dossier.reactionsAllergiques,
          dossier.notes,
          dossier.statut,
          dossier.date_naissance,
          dossier.nom,
          dossier.prenom,
          dossier.num_tel,
          ownerId,
        ],
        (insertErr) => {
          if (insertErr)
            return reject("❌ Error archiving Dossier_Medical: " + insertErr);

          const deleteSql = "DELETE FROM Dossier_Medical WHERE id = ?";
          connection.query(deleteSql, [dossier.id], (deleteErr) => {
            if (deleteErr)
              return reject("❌ Error deleting Dossier_Medical: " + deleteErr);
            console.log("✅ Dossier_Medical archived and deleted.");
            resolve();
          });
        }
      );
    });
  });
};

const transferConsultationsAndAssociatedData = (userId) => {
  return new Promise((resolve, reject) => {
    const selectConsultationsSql = `SELECT * FROM Consultation WHERE patient_id = ?`;

    connection.query(
      selectConsultationsSql,
      [userId],
      async (err, consultations) => {
        if (err) return reject("❌ Error fetching consultations: " + err);
        if (consultations.length === 0)
          return resolve("ℹ️ No consultations to transfer.");

        try {
          for (const consultation of consultations) {
            const { id_consultation } = consultation;

            // Archive Consultation
            await queryPromise(
              connectionArchive,
              `INSERT INTO archive.Consultation SET ?`,
              consultation
            );

            // Archive Examen_Medical
            const examenRows = await queryPromise(
              connection,
              `SELECT * FROM Examen_Medical WHERE consultation_id = ?`,
              [id_consultation]
            );
            if (examenRows.length > 0) {
              await queryPromise(
                connectionArchive,
                `INSERT INTO archive.Examen_Medical SET ?`,
                examenRows[0]
              );
            }

            // Archive Ordonnance & Medicaments
            const ordonnances = await queryPromise(
              connection,
              `SELECT * FROM Ordonnance WHERE consultation_id = ?`,
              [id_consultation]
            );
            if (ordonnances.length > 0) {
              const ordonnance = ordonnances[0];
              await queryPromise(
                connectionArchive,
                `INSERT INTO archive.Ordonnance SET ?`,
                ordonnance
              );

              const medicaments = await queryPromise(
                connection,
                `SELECT * FROM MedicamentsInOrdonnance WHERE ordonnance_id = ?`,
                [ordonnance.id_ordonnance]
              );
              for (const medicament of medicaments) {
                await queryPromise(
                  connectionArchive,
                  `INSERT INTO archive.MedicamentsInOrdonnance SET ?`,
                  medicament
                );
              }
            }

            await deleteConsultation(id_consultation);
          }

          console.log("✅ All consultations transferred for user:", userId);
          resolve("✅ Consultations transferred successfully.");
        } catch (error) {
          reject("❌ Error during consultation transfer: " + error);
        }
      }
    );
  });
};

exports.transferUtilisateur = async (email) => {
  try {
    console.log("➡️ Start transferring user");

    // Step 1: Find user
    const utilisateur = await Patient.findUserByEmail(email);
    if (!utilisateur) throw new Error("❌ User not found");

    // Step 2: Archive dossier
    await handleDossierTransfer(utilisateur.id);

    // Step 3: Archive consultations and related data
    await transferConsultationsAndAssociatedData(utilisateur.id);

    // Step 4: Archive user account
    await queryPromise(
      connectionArchive,
      `INSERT INTO archive.Utilisateur (id, email, password, verified) VALUES (?, ?, ?, ?)`,
      [
        utilisateur.id,
        utilisateur.email,
        utilisateur.password,
        utilisateur.verified,
      ]
    );

    // Step 5: Archive role
    const roles = ["Patient", "Medecin"];
    for (const table of roles) {
      const rows = await queryPromise(
        connection,
        `SELECT * FROM ${table} WHERE utilisateur_id = ?`,
        [utilisateur.id]
      );
      if (rows.length > 0) {
        const role = rows[0];
        let query = "";
        let params = [];

        if (table === "Medecin") {
          query = `INSERT INTO archive.Medecin (id, matricule, speciality, utilisateur_id, nom, prenom, num_tel) VALUES (?, ?, ?, ?, ?, ?, ?)`;
          params = [
            role.id,
            role.matricule,
            role.speciality,
            role.utilisateur_id,
            role.nom,
            role.prenom,
            role.num_tel,
          ];
        } else {
          query = `INSERT INTO archive.Patient (id, utilisateur_id, categorie, matricule, nom, prenom, sex, num_tel, date_naissance, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          params = [
            role.id,
            role.utilisateur_id,
            role.categorie,
            role.matricule,
            role.nom,
            role.prenom,
            role.sex,
            role.num_tel,
            role.date_naissance,
            role.photo,
          ];
        }

        await queryPromise(connectionArchive, query, params);
        break;
      }
    }

    // Step 6: Archive Directeur (if applicable)
    await checkAndArchiveDirecteur(utilisateur.id);

    // Step 7: Delete from original tables
    await queryPromise(connection, "DELETE FROM Utilisateur WHERE id = ?", [
      utilisateur.id,
    ]);
    console.log("✅ User fully transferred and removed from main DB.");
  } catch (err) {
    console.error("❌ Error during user transfer:", err);
  }
};

function queryPromise(conn, sql, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, results) => {
      if (err) {
        console.error("❌ Query error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

const checkAndRestoreDirecteur = (patientId) => {
  return new Promise((resolve, reject) => {
    const selectSql = `SELECT * FROM archive.Directeur WHERE patient_id = ?`;
    connectionArchive.query(selectSql, [patientId], (err, results) => {
      if (err) return reject("❌ Error checking Directeur: " + err);
      if (results.length === 0) return resolve("ℹ️ No Directeur to restore.");

      const directeur = results[0];
      const insertSql = `
        INSERT INTO Directeur (id, patient_id)
        VALUES (?, ?)
      `;
      const params = [
        directeur.id,
        directeur.patient_id,
        directeur.dossierMedical_id,
      ];

      connection.query(insertSql, params, (insertErr) => {
        if (insertErr)
          return reject("❌ Error restoring Directeur: " + insertErr);

        connectionArchive.query(
          `DELETE FROM archive.Directeur WHERE id = ?`,
          [directeur.id],
          (deleteErr) => {
            if (deleteErr)
              return reject(
                "❌ Error deleting archived Directeur: " + deleteErr
              );
            resolve("✅ Directeur restored and archive deleted.");
          }
        );
      });
    });
  });
};
const restoreConsultationsAndAssociatedData = async (patientId) => {
  console.log("➡️ Restoring consultations for patient:", patientId);

  const consultations = await queryPromise(
    connectionArchive,
    `SELECT * FROM archive.Consultation WHERE patient_id = ?`,
    [patientId]
  );

  if (consultations.length === 0) {
    console.log("ℹ️ No archived consultations to restore.");
    return;
  }

  for (const consultation of consultations) {
    const { id_consultation } = consultation;

    // Insert Consultation
    await queryPromise(
      connection,
      `INSERT INTO Consultation SET ?`,
      consultation
    );

    console.log("✅ Restored Consultation:", id_consultation);

    // Restore Examen_Medical
    const examens = await queryPromise(
      connectionArchive,
      `SELECT * FROM archive.Examen_Medical WHERE consultation_id = ?`,
      [id_consultation]
    );

    for (const examen of examens) {
      await queryPromise(
        connection,
        `INSERT INTO Examen_Medical SET ?`,
        examen
      );
      console.log(
        "✅ Restored Examen_Medical for consultation:",
        id_consultation
      );
    }

    // Restore Ordonnance
    const ordonnances = await queryPromise(
      connectionArchive,
      `SELECT * FROM archive.Ordonnance WHERE consultation_id = ?`,
      [id_consultation]
    );

    for (const ordonnance of ordonnances) {
      await queryPromise(
        connection,
        `INSERT INTO Ordonnance SET ?`,
        ordonnance
      );
      console.log("✅ Restored Ordonnance:", ordonnance.id_ordonnance);

      // Restore Medicaments
      const medicaments = await queryPromise(
        connectionArchive,
        `SELECT * FROM archive.MedicamentsInOrdonnance WHERE ordonnance_id = ?`,
        [ordonnance.id_ordonnance]
      );

      for (const medicament of medicaments) {
        await queryPromise(
          connection,
          `INSERT INTO MedicamentsInOrdonnance SET ?`,
          medicament
        );
      }
      console.log(
        `✅ Restored ${medicaments.length} medicaments for ordonnance: ${ordonnance.id_ordonnance}`
      );
    }

    // Delete archived Consultation and related
    await queryPromise(
      connectionArchive,
      `DELETE FROM archive.Consultation WHERE id_consultation = ?`,
      [id_consultation]
    );

    await queryPromise(
      connectionArchive,
      `DELETE FROM archive.Examen_Medical WHERE consultation_id = ?`,
      [id_consultation]
    );

    await queryPromise(
      connectionArchive,
      `DELETE FROM archive.Ordonnance WHERE consultation_id = ?`,
      [id_consultation]
    );
  }

  console.log("✅ All consultations restored for patient:", patientId);
};

const restoreDossierMedical = async (userId) => {
  const dossierRows = await queryPromise(
    connectionArchive,
    `SELECT * FROM archive.Dossier_Medical WHERE utilisateur_id = ?`,
    [userId]
  );

  if (dossierRows.length === 0) {
    console.log("ℹ️ No archived Dossier_Medical found.");
    return;
  }

  const dossier = dossierRows[0];

  const insertDossierQuery = `
    INSERT INTO Dossier_Medical (
      id, date_creation, groupeSanguin, numSecuriteSociale, adresse, situation_famille, 
      taille, poids, tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre, 
      tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, periode_exposition, alcool, 
      medicaments, affectionsCongenitales, maladiesGenerales, interventionsChirurgicales, 
      reactionsAllergiques, notes, statut, date_naissance, nom, prenom, num_tel, utilisateur_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await queryPromise(connection, insertDossierQuery, [
    dossier.id,
    dossier.date_creation,
    dossier.groupeSanguin,
    dossier.numSecuriteSociale,
    dossier.adresse,
    dossier.situation_famille,
    dossier.taille,
    dossier.poids,
    dossier.tabac_fume,
    dossier.tabac_fume_nombre,
    dossier.tabac_chique,
    dossier.tabac_chique_nombre,
    dossier.tabac_pris,
    dossier.tabac_pris_nombre,
    dossier.age_pris,
    dossier.ancien_fume,
    dossier.periode_exposition,
    dossier.alcool,
    dossier.medicaments,
    dossier.affectionsCongenitales,
    dossier.maladiesGenerales,
    dossier.interventionsChirurgicales,
    dossier.reactionsAllergiques,
    dossier.notes,
    dossier.statut,
    dossier.date_naissance,
    dossier.nom,
    dossier.prenom,
    dossier.num_tel,
    dossier.utilisateur_id,
  ]);

  console.log("✅ Restored Dossier_Medical");

  await queryPromise(
    connectionArchive,
    `DELETE FROM archive.Dossier_Medical WHERE id = ?`,
    [dossier.id]
  );
};
exports.restoreUtilisateur = async (email) => {
  try {
    console.log("➡️ Start restoring user");

    // Step 1: Find the user in archive
    const utilisateurRows = await queryPromise(
      connectionArchive,
      `SELECT * FROM archive.Utilisateur WHERE email = ?`,
      [email]
    );

    if (utilisateurRows.length === 0)
      throw new Error("❌ Archived user not found");

    const utilisateur = utilisateurRows[0];

    // Step 2: Restore Utilisateur
    await queryPromise(
      connection,
      `
      INSERT INTO Utilisateur (id, email, password, verified)
      VALUES (?, ?, ?, ?)
      `,
      [
        utilisateur.id,
        utilisateur.email,
        utilisateur.password,
        utilisateur.verified,
      ]
    );
    console.log("✅ User restored to Utilisateur");

    // Step 3: Check and Restore Role (Patient or Medecin)
    const tables = ["Patient", "Medecin"];

    let roleRestored = false;

    for (const table of tables) {
      const roleRows = await queryPromise(
        connectionArchive,
        `SELECT * FROM archive.${table} WHERE utilisateur_id = ?`,
        [utilisateur.id]
      );

      if (roleRows.length > 0) {
        const role = roleRows[0];

        let insertRoleQuery = "";
        let insertParams = [];

        if (table === "Medecin") {
          insertRoleQuery = `
            INSERT INTO Medecin (id, matricule, speciality, utilisateur_id, nom, prenom, num_tel)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          insertParams = [
            role.id,
            role.matricule,
            role.speciality,
            role.utilisateur_id,
            role.nom,
            role.prenom,
            role.num_tel,
          ];
        } else if (table === "Patient") {
          insertRoleQuery = `
            INSERT INTO Patient (id, utilisateur_id, categorie, matricule, nom, prenom, sex,num_tel, date_naissance, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?)
          `;
          insertParams = [
            role.id,
            role.utilisateur_id,
            role.categorie,
            role.matricule,
            role.nom,
            role.prenom,
            role.sex,
            role.num_tel,
            role.date_naissance,
            role.photo,
          ];
        }

        await queryPromise(connection, insertRoleQuery, insertParams);
        console.log(`✅ ${table} restored.`);

        roleRestored = true;

        // If Patient, restore consultations and dossier
        if (table === "Patient") {
          await restoreDossierMedical(utilisateur.id);
          await restoreConsultationsAndAssociatedData(role.id);
        }

        // Delete from archive
        await queryPromise(
          connectionArchive,
          `DELETE FROM archive.${table} WHERE id = ?`,
          [role.id]
        );

        break; // Exit after restoring the first role
      }
    }

    if (!roleRestored) {
      throw new Error("❌ Archived role not found");
    }

    // Delete from archive.Utilisateur
    await queryPromise(
      connectionArchive,
      `DELETE FROM archive.Utilisateur WHERE id = ?`,
      [utilisateur.id]
    );

    console.log("✅ User and role successfully deleted from archive.");

    return {
      message: `✅ User and role successfully restored.`,
      utilisateurId: utilisateur.id,
    };
  } catch (error) {
    console.error("❌ Error in restoreUtilisateur:", error);
    throw error;
  }
};
exports.getArchivedUtilisateurs = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        u.id, 
        COALESCE( m.matricule, p.matricule) AS matricule, 
        COALESCE( m.nom, p.nom) AS nom, 
        COALESCE( m.prenom, p.prenom) AS prenom,  -- Added prenom here
        u.email,
        COALESCE(
          CASE
            WHEN m.matricule IS NOT NULL THEN 'medecin'
            WHEN p.matricule IS NOT NULL THEN p.categorie
            ELSE 'unknown'
          END, 
          'unknown'
        ) AS role
      FROM 
        archive.Utilisateur u
      LEFT JOIN 
        archive.Medecin m ON u.id = m.utilisateur_id
      LEFT JOIN 
        archive.Patient p ON u.id = p.utilisateur_id
      
    `;

    connectionArchive.query(query, (err, results) => {
      if (err) return reject("❌ Error fetching archived utilisateurs: " + err);
      resolve(results);
    });
  });
};
