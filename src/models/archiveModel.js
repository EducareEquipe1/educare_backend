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
  
        // Insert into archive.Utilisateur
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
  
            // Check which table the user is in
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
  
                  // Log the role data for debugging
                  console.log(`Role data for ${table}:`, role);
  
                  // Insert into archive.[role]
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
  
                  console.log(`Executing query for ${table}:`, insertRoleQuery, insertParams);
  
                  connectionArchive.query(
                    insertRoleQuery,
                    insertParams,
                    (insertRoleErr) => {
                      if (insertRoleErr)
                        return reject(
                          `❌ Error archiving ${table}: ` + insertRoleErr
                        );
  
                      // Delete from role table
                      const deleteRoleQuery = `DELETE FROM ${table} WHERE id = ?`;
                      connection.query(
                        deleteRoleQuery,
                        [role.id],
                        (deleteRoleErr) => {
                          if (deleteRoleErr)
                            return reject(
                              `❌ Error deleting from ${table}: ` + deleteRoleErr
                            );
  
                          // Delete from Utilisateur table
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
  
                              console.log(
                                `✅ User and ${table} successfully archived.`
                              );
                              resolve(
                                `✅ User and ${table} successfully archived.`
                              );
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
    try {
      console.log("⬅️ Start restoring user");

      if (typeof email !== "string" || email.trim() === "") {
        return reject("❌ Invalid email format");
      }

      const userQuery = "SELECT * FROM archive.Utilisateur WHERE email = ?";
      connectionArchive.query(userQuery, [email], (err, userResults) => {
        if (err) return reject("❌ Error fetching archived user: " + err);
        if (userResults.length === 0)
          return reject("❌ Archived user not found");

        const utilisateur = userResults[0];

        // Insert into main.Utilisateur
        const insertUserQuery = `
            INSERT INTO Utilisateur (id, email, password, verified)
            VALUES (?, ?, ?, ?)
          `;
        connection.query(
          insertUserQuery,
          [
            utilisateur.id,
            utilisateur.email,
            utilisateur.password,
            utilisateur.verified,
          ],
          (insertUserErr) => {
            if (insertUserErr)
              return reject("❌ Error restoring Utilisateur: " + insertUserErr);

            // Check which role table the user belongs to in archive
            const tables = ["Patient", "Medecin", "Directeur"];
            const checkTable = (index) => {
              if (index >= tables.length)
                return reject("❌ User role not found in archive");

              const table = tables[index];
              const roleQuery = `SELECT * FROM archive.${table} WHERE utilisateur_id = ?`;
              connectionArchive.query(
                roleQuery,
                [utilisateur.id],
                (roleErr, roleResults) => {
                  if (roleErr)
                    return reject(
                      `❌ Error querying archive.${table}: ` + roleErr
                    );
                  if (roleResults.length === 0) return checkTable(index + 1);

                  const role = roleResults[0];

                  // Insert into main.[role]
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

                      // Delete from archive.[role]
                      const deleteRoleQuery = `DELETE FROM archive.${table} WHERE id = ?`;
                      connectionArchive.query(
                        deleteRoleQuery,
                        [role.id],
                        (deleteRoleErr) => {
                          if (deleteRoleErr)
                            return reject(
                              `❌ Error deleting from archive.${table}: ` +
                                deleteRoleErr
                            );

                          // Delete from archive.Utilisateur
                          const deleteUserQuery =
                            "DELETE FROM archive.Utilisateur WHERE id = ?";
                          connectionArchive.query(
                            deleteUserQuery,
                            [utilisateur.id],
                            (deleteUserErr) => {
                              if (deleteUserErr)
                                return reject(
                                  "❌ Error deleting archived user: " +
                                    deleteUserErr
                                );

                              console.log(
                                `✅ User and ${table} successfully restored.`
                              );
                              resolve(
                                `✅ User and ${table} successfully restored.`
                              );
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
    } catch (err) {
      reject("❌ An unexpected error occurred: " + err.message);
    }
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
  
  exports.transferDossierMedical = async (email) => {
    return new Promise((resolve, reject) => {
      console.log("➡️ Start transferring DossierMedical");
  
      const selectQuery = `
        SELECT * FROM DossierMedical WHERE patient_id = ?
      `;
  
      connection.query(selectQuery, [email], (err, results) => {
        if (err) return reject("❌ Error fetching dossier: " + err);
        if (results.length === 0) return reject("❌ DossierMedical not found");
  
        const dossier = results[0];
  
        const insertQuery = `
          INSERT INTO archive.DossierMedical (
            id, date_creation, groupeSanguin, numSecuriteSociale, lieu_naissance,
            adresse, situation_famille, date_admis, taille, poids, 
            tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre, 
            tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, 
            periode_exposition, alcool, medicaments, affectionsCongenitales, 
            maladiesGenerales, interventionsChirurgicales, reactionsAllergiques, 
            notes, patient_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
        const insertValues = [
          dossier.id,
          dossier.date_creation,
          dossier.groupeSanguin,
          dossier.numSecuriteSociale,
          dossier.lieu_naissance,
          dossier.adresse,
          dossier.situation_famille,
          dossier.date_admis,
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
          dossier.patient_id,
        ];
  
        connectionArchive.query(insertQuery, insertValues, (insertErr) => {
          if (insertErr)
            return reject("❌ Error archiving DossierMedical: " + insertErr);
  
          const deleteQuery = `DELETE FROM DossierMedical WHERE email = ?`;
          connection.query(deleteQuery, [dossier.email], (deleteErr) => {
            if (deleteErr)
              return reject("❌ Error deleting DossierMedical: " + deleteErr);
  
            console.log("✅ DossierMedical successfully archived.");
            resolve("✅ DossierMedical successfully archived.");
          });
        });
      });
    });
  };

  
  exports.restoreDossierMedical = async (email) => {
    return new Promise((resolve, reject) => {
      console.log("🔁 Start restoring DossierMedical");
  
      const selectQuery = `
        SELECT * FROM archive.DossierMedical WHERE patient_id = ?
      `;
  
      connectionArchive.query(selectQuery, [patientId], (err, results) => {
        if (err) return reject("❌ Error fetching archived dossier: " + err);
        if (results.length === 0)
          return reject("❌ Archived DossierMedical not found");
  
        const dossier = results[0];
  
        const insertQuery = `
          INSERT INTO DossierMedical (
            id, date_creation, groupeSanguin, numSecuriteSociale, lieu_naissance,
            adresse, situation_famille, date_admis, taille, poids, 
            tabac_fume, tabac_fume_nombre, tabac_chique, tabac_chique_nombre, 
            tabac_pris, tabac_pris_nombre, age_pris, ancien_fume, 
            periode_exposition, alcool, medicaments, affectionsCongenitales, 
            maladiesGenerales, interventionsChirurgicales, reactionsAllergiques, 
            notes, patient_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
        const insertValues = [
          dossier.id,
          dossier.date_creation,
          dossier.groupeSanguin,
          dossier.numSecuriteSociale,
          dossier.lieu_naissance,
          dossier.adresse,
          dossier.situation_famille,
          dossier.date_admis,
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
          dossier.patient_id,
        ];
  
        connection.query(insertQuery, insertValues, (insertErr) => {
          if (insertErr)
            return reject("❌ Error restoring DossierMedical: " + insertErr);
  
          const deleteQuery = `DELETE FROM archive.DossierMedical WHERE id = ?`;
          connectionArchive.query(deleteQuery, [dossier.id], (deleteErr) => {
            if (deleteErr)
              return reject(
                "❌ Error deleting from archive.DossierMedical: " + deleteErr
              );
  
            console.log("✅ DossierMedical successfully restored.");
            resolve("✅ DossierMedical successfully restored.");
          });
        });
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
