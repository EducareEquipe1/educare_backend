const connection = require("../db.js");
const connectionArchive = require("../archiveDb");
//✅all page  
//✅modification Directeur added 

const checkAndArchiveDirecteur = (patientId) => {
  return new Promise((resolve, reject) => {
    const selectDirecteurSql = `SELECT * FROM Directeur WHERE patient_id = ?`;
    connection.query(selectDirecteurSql, [patientId], (err, results) => {
      if (err) return reject("❌ Error checking Directeur: " + err);
      if (results.length === 0) return resolve("No Directeur found.");

      const directeur = results[0];

      const insertArchiveSql = `
        INSERT INTO archive.Directeur (id, patient_id)
        VALUES (?, ?)
      `;
      const params = [
        directeur.id,
        directeur.patient_id,
        directeur.dossierMedical_id,
      ];

      connectionArchive.query(insertArchiveSql, params, (insertErr) => {
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
const handleDossierTransfer = (ownerId)=> {
  const dossierQuery =
    "SELECT * FROM Dossier_Medical WHERE utilisateur_id = ?";
  connection.query(dossierQuery, [ownerId], (err, dossierResults) => {
    if (err) return reject("❌ Error fetching Dossier_Medical: " + err);

    if (dossierResults.length === 0) {
      console.log(
        `ℹ️ User with id ${ownerId} does not have a Dossier_Medical.`
      );
      // Don't return or reject, just continue
      return;
    }

    const dossier = dossierResults[0];

    const archiveDossierQuery = `
      INSERT INTO archive.Dossier_Medical 
      (id, date_creation, groupeSanguin, numSecuriteSociale, adresse, situation_famille, 
       taille, poids, tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre, 
       tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, periode_exposition, alcool, 
       medicaments, affectionsCongenitales, maladiesGenerales, interventionsChirurgicales, 
       reactionsAllergiques, notes, statut, date_naissance, nom, prenom, num_tel, utilisateur_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connectionArchive.query(
      archiveDossierQuery,
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
          return reject(
            "❌ Error archiving Dossier_Medical: " + insertErr
          );

        const deleteDossierQuery =
          "DELETE FROM Dossier_Medical WHERE id = ?";
        connection.query(
          deleteDossierQuery,
          [dossier.id],
          (deleteErr) => {
            if (deleteErr)
              return reject(
                "❌ Error deleting Dossier_Medical: " + deleteErr
              );

            console.log("✅ Dossier_Medical archived and deleted.");
          }
        );
      }
    );
  });
};

exports.transferUtilisateur = async (email) => {
  return new Promise((resolve, reject) => {
    console.log("➡️ Start transferring user");

    const userQuery = "SELECT * FROM Utilisateur WHERE email = ?";
    connection.query(userQuery, [email], (err, userResults) => {
      if (err) return reject("❌ Error fetching user: " + err);
      if (userResults.length === 0) return reject("❌ User not found");

      const utilisateur = userResults[0];
      console.log(utilisateur.id);

      // ✅ Don't touch this: Dossier_Medical logic
      handleDossierTransfer(utilisateur.id);

      const insertUserQuery = `
        INSERT INTO archive.Utilisateur (id, email, password, verified)
        VALUES (?, ?, ?, ?)
      `;
      connectionArchive.query(
        insertUserQuery,
        [
          utilisateur.id,
          utilisateur.email,
          utilisateur.password,
          utilisateur.verified,
        ],
        (insertUserErr) => {
          if (insertUserErr)
            return reject("❌ Error archiving Utilisateur: " + insertUserErr);

          const tables = ["Patient", "Medecin"];
          const checkTable = (index) => {
            if (index >= tables.length) return reject("❌ User role not found");

            const table = tables[index];
            const roleQuery = `SELECT * FROM ${table} WHERE utilisateur_id = ?`;

            connection.query(
              roleQuery,
              [utilisateur.id],
              (roleErr, roleResults) => {
                if (roleErr)
                  return reject(`❌ Error querying ${table}: ` + roleErr);
                if (roleResults.length === 0) return checkTable(index + 1);

                const role = roleResults[0];
                let insertRoleQuery = "";
                let insertParams = [];

                if (table === "Medecin") {
                  insertRoleQuery = `
                    INSERT INTO archive.Medecin (id, matricule, speciality, utilisateur_id, nom, prenom, num_tel)
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
                    INSERT INTO archive.Patient (id, utilisateur_id, categorie, matricule, nom, prenom, num_tel, date_naissance, photo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `;
                  insertParams = [
                    role.id,
                    role.utilisateur_id,
                    role.categorie,
                    role.matricule,
                    role.nom,
                    role.prenom,
                    role.num_tel,
                    role.date_naissance,
                    role.photo,
                  ];
                }

                connectionArchive.query(
                  insertRoleQuery,
                  insertParams,
                  async (insertRoleErr) => {
                    if (insertRoleErr)
                      return reject(
                        `❌ Error archiving ${table}: ` + insertRoleErr
                      );

                    // ✅ Check if this Patient was a Directeur
                    if (table === "Patient") {
                      try {
                        const directeurResult = await checkAndArchiveDirecteur(role.id);
                        console.log(directeurResult);
                      } catch (e) {
                        console.error(e);
                      }
                    }

                    const deleteRoleQuery = `DELETE FROM ${table} WHERE id = ?`;
                    connection.query(
                      deleteRoleQuery,
                      [role.id],
                      (deleteRoleErr) => {
                        if (deleteRoleErr)
                          return reject(
                            `❌ Error deleting from ${table}: ` + deleteRoleErr
                          );

                        const deleteUserQuery =
                          "DELETE FROM Utilisateur WHERE id = ?";
                        connection.query(
                          deleteUserQuery,
                          [utilisateur.id],
                          (deleteUserErr) => {
                            if (deleteUserErr)
                              return reject(
                                "❌ Error deleting user: " + deleteUserErr
                              );

                            resolve({
                              message: `✅ User and ${table} successfully archived.`,
                              utilisateurId: utilisateur.id,
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          };

          checkTable(0);
        }
      );
    });
  });
};

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
              return reject("❌ Error deleting archived Directeur: " + deleteErr);
            resolve("✅ Directeur restored and archive deleted.");
          }
        );
      });
    });
  });
};
const handleRestoreDossierMedical = (utilisateurId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM archive.Dossier_Medical WHERE utilisateur_id = ?`;

    connectionArchive.query(query, [utilisateurId], (err, results) => {
      if (err) return reject("❌ Error fetching archived dossier: " + err);

      if (results.length === 0) {
        console.log(`ℹ️ No Dossier_Medical found for user ID ${utilisateurId}`);
        return resolve("No dossier to restore.");
      }

      const dossier = results[0];

      const insertQuery = `
        INSERT INTO Dossier_Medical 
        (id, date_creation, groupeSanguin, numSecuriteSociale, adresse, situation_famille, 
         taille, poids, tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre, 
         tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, periode_exposition, alcool, 
         medicaments, affectionsCongenitales, maladiesGenerales, interventionsChirurgicales, 
         reactionsAllergiques, notes, statut, date_naissance, nom, prenom, num_tel, utilisateur_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      connection.query(
        insertQuery,
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
          utilisateurId,
        ],
        (insertErr) => {
          if (insertErr)
            return reject("❌ Error restoring Dossier_Medical: " + insertErr);

          connectionArchive.query(
            "DELETE FROM archive.Dossier_Medical WHERE id = ?",
            [dossier.id],
            (deleteErr) => {
              if (deleteErr)
                return reject("❌ Error deleting archived dossier: " + deleteErr);

              console.log("✅ Dossier_Medical restored and archive deleted.");
              resolve("✅ Dossier_Medical successfully restored.");
            }
          );
        }
      );
    });
  });
};
exports.restoreUtilisateur = async (email) => {
  return new Promise((resolve, reject) => {
    console.log("🔁 Start restoring user");

    const userQuery = "SELECT * FROM archive.Utilisateur WHERE email = ?";
    connectionArchive.query(userQuery, [email], async (err, userResults) => {
      if (err) return reject("❌ Error fetching user from archive: " + err);
      if (userResults.length === 0) return reject("❌ Archived user not found");

      const utilisateur = userResults[0];

      const restoreUserQuery = `
        INSERT INTO Utilisateur (id, email, password, verified)
        VALUES (?, ?, ?, ?)
      `;
      connection.query(
        restoreUserQuery,
        [
          utilisateur.id,
          utilisateur.email,
          utilisateur.password,
          utilisateur.verified,
        ],
        async (restoreUserErr) => {
          if (restoreUserErr)
            return reject("❌ Error restoring Utilisateur: " + restoreUserErr);

          try {
            // ✅ Restore Dossier_Medical if exists
            await handleRestoreDossierMedical(utilisateur.id);
          } catch (e) {
            console.error(e); // optional: return reject(e);
          }

          // ✅ Now check roles: Patient, Medecin
          const tables = ["Patient", "Medecin"];
          const checkTable = (index) => {
            if (index >= tables.length)
              return reject("❌ Archived role not found");

            const table = tables[index];
            const roleQuery = `SELECT * FROM archive.${table} WHERE utilisateur_id = ?`;

            connectionArchive.query(
              roleQuery,
              [utilisateur.id],
              async (roleErr, roleResults) => {
                if (roleErr)
                  return reject(`❌ Error fetching ${table} from archive: ` + roleErr);
                if (roleResults.length === 0) return checkTable(index + 1);

                const role = roleResults[0];
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
                    INSERT INTO Patient (id, utilisateur_id, categorie, matricule, nom, prenom, num_tel, date_naissance, photo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `;
                  insertParams = [
                    role.id,
                    role.utilisateur_id,
                    role.categorie,
                    role.matricule,
                    role.nom,
                    role.prenom,
                    role.num_tel,
                    role.date_naissance,
                    role.photo,
                  ];
                }

                connection.query(
                  insertRoleQuery,
                  insertParams,
                  async (insertRoleErr) => {
                    if (insertRoleErr)
                      return reject(`❌ Error restoring ${table}: ` + insertRoleErr);

                    if (table === "Patient") {
                      try {
                        const directeurResult = await checkAndRestoreDirecteur(role.id);
                        console.log(directeurResult);
                      } catch (e) {
                        console.error(e);
                      }
                    }

                    // Clean up archived role and user
                    connectionArchive.query(
                      `DELETE FROM archive.${table} WHERE id = ?`,
                      [role.id]
                    );
                    connectionArchive.query(
                      "DELETE FROM archive.Utilisateur WHERE id = ?",
                      [utilisateur.id],
                      (deleteUserErr) => {
                        if (deleteUserErr)
                          return reject("❌ Error deleting user from archive: " + deleteUserErr);

                        resolve({
                          message: `✅ User and ${table} successfully restored.`,
                          utilisateurId: utilisateur.id,
                        });
                      }
                    );
                  }
                );
              }
            );
          };

          checkTable(0);
        }
      );
    });
  });
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

/*
exports.findArchivedUser = async (email) => {
    return new Promise((resolve, reject) => {
      console.log("🔍 Searching for archived user");
  
      const userQuery = "SELECT * FROM archive.Utilisateur WHERE email = ?";
      connectionArchive.query(userQuery, [email], (err, userResults) => {
        if (err) return reject("❌ Error fetching archived user: " + err);
        if (userResults.length === 0) return reject("❌ Archived user not found");
  
        const utilisateur = userResults[0];
  
        // Find the role of the user in the archive tables
        const tables = ["Patient", "Medecin", "Directeur"];
        const checkTable = (index) => {
          if (index >= tables.length) return reject("❌ User role not found in archive");
  
          const table = tables[index];
          const roleQuery = `SELECT * FROM archive.${table} WHERE utilisateur_id = ?`;
          connectionArchive.query(roleQuery, [utilisateur.id], (roleErr, roleResults) => {
            if (roleErr) return reject(`❌ Error querying archive.${table}: ` + roleErr);
            if (roleResults.length === 0) return checkTable(index + 1);
  
            const role = roleResults[0];
            console.log(`✅ Found archived user with role ${table}:`, role);
            resolve({ utilisateur, role });
          });
        };
  
        checkTable(0);
      });
    });
  };
  
*/
