const connection = require("../db.js");
const connectionArchive = require("../archiveDb");

exports.transferUtilisateur = async (email) => {
  return new Promise((resolve, reject) => {
    console.log("➡️ Start transferring user");

    const userQuery = "SELECT * FROM Utilisateur WHERE email = ?";
    connection.query(userQuery, [email], (err, userResults) => {
      if (err) return reject("❌ Error fetching user: " + err);
      if (userResults.length === 0) return reject("❌ User not found");

      const utilisateur = userResults[0];
      console.log(utilisateur.id);

      function handleDossierTransfer(ownerId) {
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
      }

      // Start transferring dossier first
      handleDossierTransfer(utilisateur.id);

      // Then insert user into archive
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

          const tables = ["Patient", "Medecin", "Directeur"];
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
                } else if (table === "Directeur") {
                  insertRoleQuery = `
                  INSERT INTO archive.Directeur (id, matricule, utilisateur_id, nom, prenom, num_tel, photo_profil, date_naissance)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                  insertParams = [
                    role.id,
                    role.matricule,
                    role.utilisateur_id,
                    role.nom,
                    role.prenom,
                    role.num_tel,
                    role.photo_profil,
                    role.date_naissance,
                  ];
                }

                connectionArchive.query(
                  insertRoleQuery,
                  insertParams,
                  (insertRoleErr) => {
                    if (insertRoleErr)
                      return reject(
                        `❌ Error archiving ${table}: ` + insertRoleErr
                      );

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

exports.restoreUtilisateur = async (email) => {
  return new Promise((resolve, reject) => {
    console.log("🔁 Start restoring user");

    const userQuery = "SELECT * FROM archive.Utilisateur WHERE email = ?";
    connectionArchive.query(userQuery, [email], async (err, userResults) => {
      if (err) return reject("❌ Error fetching user from archive: " + err);
      if (userResults.length === 0) return reject("❌ Archived user not found");

      const utilisateur = userResults[0];

      // Restore user first
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
        (restoreUserErr) => {
          if (restoreUserErr)
            return reject("❌ Error restoring Utilisateur: " + restoreUserErr);

          // Restore Dossier_Medical if exists
          const dossierQuery = `SELECT * FROM archive.Dossier_Medical WHERE utilisateur_id = ?`;
          connectionArchive.query(
            dossierQuery,
            [utilisateur.id],
            (err, dossierResults) => {
              if (err)
                return reject("❌ Error fetching archived dossier: " + err);

              if (dossierResults.length > 0) {
                const dossier = dossierResults[0];

                const insertDossierQuery = `
                INSERT INTO Dossier_Medical 
                (id, date_creation, groupeSanguin, numSecuriteSociale, adresse, situation_famille, 
                 taille, poids, tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre, 
                 tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, periode_exposition, alcool, 
                 medicaments, affectionsCongenitales, maladiesGenerales, interventionsChirurgicales, 
                 reactionsAllergiques, notes, statut, date_naissance, nom, prenom, num_tel, utilisateur_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
                connection.query(
                  insertDossierQuery,
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
                    utilisateur.id,
                  ],
                  (insertErr) => {
                    if (insertErr)
                      return reject("❌ Error restoring dossier: " + insertErr);

                    // Delete from archive
                    connectionArchive.query(
                      "DELETE FROM archive.Dossier_Medical WHERE id = ?",
                      [dossier.id]
                    );
                  }
                );
              }

              // Now restore the role
              const tables = ["Patient", "Medecin", "Directeur"];
              const checkTable = (index) => {
                if (index >= tables.length)
                  return reject("❌ Archived role not found");

                const table = tables[index];
                const roleQuery = `SELECT * FROM archive.${table} WHERE utilisateur_id = ?`;

                connectionArchive.query(
                  roleQuery,
                  [utilisateur.id],
                  (roleErr, roleResults) => {
                    if (roleErr)
                      return reject(
                        `❌ Error fetching ${table} from archive: ` + roleErr
                      );
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
                    } else if (table === "Directeur") {
                      insertRoleQuery = `
                    INSERT INTO Directeur (id, matricule, utilisateur_id, nom, prenom, num_tel, photo_profil, date_naissance)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `;
                      insertParams = [
                        role.id,
                        role.matricule,
                        role.utilisateur_id,
                        role.nom,
                        role.prenom,
                        role.num_tel,
                        role.photo_profil,
                        role.date_naissance,
                      ];
                    }

                    connection.query(
                      insertRoleQuery,
                      insertParams,
                      (insertRoleErr) => {
                        if (insertRoleErr)
                          return reject(
                            `❌ Error restoring ${table}: ` + insertRoleErr
                          );

                        // Delete role from archive
                        connectionArchive.query(
                          `DELETE FROM archive.${table} WHERE id = ?`,
                          [role.id]
                        );

                        // Finally, delete the archived user
                        connectionArchive.query(
                          "DELETE FROM archive.Utilisateur WHERE id = ?",
                          [utilisateur.id],
                          (deleteUserErr) => {
                            if (deleteUserErr)
                              return reject(
                                "❌ Error deleting user from archive: " +
                                  deleteUserErr
                              );

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
        COALESCE(d.matricule, m.matricule, p.matricule) AS matricule, 
        COALESCE(d.nom, m.nom, p.nom) AS nom, 
        COALESCE(d.prenom, m.prenom, p.prenom) AS prenom,  -- Added prenom here
        u.email,
        COALESCE(
          CASE
            WHEN d.matricule IS NOT NULL THEN 'directeur'
            WHEN m.matricule IS NOT NULL THEN 'medecin'
            WHEN p.matricule IS NOT NULL THEN p.categorie
            ELSE 'unknown'
          END, 
          'unknown'
        ) AS role
      FROM 
        archive.Utilisateur u
      LEFT JOIN 
        archive.Directeur d ON u.id = d.utilisateur_id
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
