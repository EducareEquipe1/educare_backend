const connection = require("../db"); // Import the database connection
const connectionArchive = require("../archiveDb"); // Import the database connection
const bcrypt = require("bcrypt");
const util = require("util");
//✅all page
//✅directeur modifications added
exports.findUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Utilisateur WHERE email = ?";
    connection.query(sql, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
};
exports.findPatientByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.* 
      FROM Patient p
      INNER JOIN Utilisateur u 
        ON p.utilisateur_id = u.id
      WHERE u.email = ?
      LIMIT 1
    `;
    connection.query(sql, [email], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

exports.findPatientByUtilisateurId = async (utilisateur_id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Patient  WHERE utilisateur_id = ?";
    connection.query(sql, [utilisateur_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
};
exports.findPatientByUtilisateurIdArchived = async (utilisateur_id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Patient  WHERE utilisateur_id = ?";
    connectionArchive.query(sql, [utilisateur_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
};
exports.findDirecteurByUtilisateurId = async (utilisateur_id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM Patient WHERE utilisateur_id = ?  AND id IN (SELECT patient_id FROM Directeur)";
    connection.query(sql, [utilisateur_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
};
exports.findDirecteurByUtilisateurIdArchived = async (utilisateur_id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM Patient WHERE utilisateur_id = ?  AND id IN (SELECT patient_id FROM Directeur)";
    connectionArchive.query(sql, [utilisateur_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
};

exports.findUserByEmailArchived = async (email) => {
  console.log("im looking inside archive");
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Utilisateur WHERE email = ?";
    console.log(connectionArchive);
    connectionArchive.query(sql, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log("results is", results);
        resolve(results.length > 0 ? results[0] : null);
      }
      console.log(results);
    });
  });
};

exports.updatePatientActivation = async (email) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE Utilisateur SET verified = ? WHERE email = ?";
    connection.query(query, [true, email], (err, result) => {
      //the problem is exactlo on this line it give us an error
      if (err) {
        reject(err);
      } else {
        resolve(result);
        console.log("im here");
      }
    });
  });
};

exports.createPatient = (patientData, userType) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) return reject(err);

      const verified =
        userType === "Admin" || userType === "Medecin" ? true : false;

      const userSql = `
        INSERT INTO Utilisateur (email, password, verified)
        VALUES (?, ?, ?);
      `;
      const userValues = [patientData.email, patientData.password, verified];

      connection.query(userSql, userValues, (err, userResult) => {
        if (err) return connection.rollback(() => reject(err));

        const utilisateurId = userResult.insertId;

        const patientSql = `
          INSERT INTO Patient (utilisateur_id, matricule, nom, prenom, date_naissance, num_tel , categorie) 
          VALUES (?, ?, ?, ?, ?, ? , ?);
        `;
        const patientValues = [
          utilisateurId,
          patientData.matricule,
          patientData.nom,
          patientData.prenom,
          patientData.date_naissance,
          patientData.num_tel,
          patientData.categorie,
        ];

        connection.query(patientSql, patientValues, (err, patientResult) => {
          if (err) return connection.rollback(() => reject(err));

          const patientId = patientResult.insertId;

          // If Directeur, insert into Directeur after Patient
          if (userType === "Directeur") {
            const directeurSql = `
              INSERT INTO Directeur (patient_id)
              VALUES (?);
            `;
            connection.query(
              directeurSql,
              [patientId],
              (err, directeurResult) => {
                if (err) return connection.rollback(() => reject(err));

                connection.commit((err) => {
                  if (err) return connection.rollback(() => reject(err));
                  resolve({
                    utilisateurId,
                    patientId,
                    directeurId: directeurResult.insertId,
                  });
                });
              }
            );
          } else {
            connection.commit((err) => {
              if (err) return connection.rollback(() => reject(err));
              resolve({
                utilisateurId,
                patientId,
              });
            });
          }
        });
      });
    });
  });
};
exports.createPatientVerified = (patientData) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) return reject(err);

      const userSql = `
        INSERT INTO Utilisateur (email, password, verified)
        VALUES (?, ?, true); -- auto-verified
      `;
      const userValues = [patientData.email, patientData.password];

      connection.query(userSql, userValues, (err, userResult) => {
        if (err) return connection.rollback(() => reject(err));

        const utilisateurId = userResult.insertId;

        const patientSql = `
          INSERT INTO Patient (utilisateur_id, matricule, nom, prenom, date_naissance, num_tel, categorie)
          VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const patientValues = [
          utilisateurId,
          patientData.matricule,
          patientData.nom,
          patientData.prenom,
          patientData.date_naissance,
          patientData.num_tel,
          patientData.categorie,
        ];

        connection.query(patientSql, patientValues, (err, patientResult) => {
          if (err) return connection.rollback(() => reject(err));

          connection.commit((err) => {
            if (err) return connection.rollback(() => reject(err));
            resolve({
              utilisateurId,
              patientId: patientResult.insertId,
            });
          });
        });
      });
    });
  });
};

exports.getUtilisateurs = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        u.id, 
        COALESCE( m.matricule, p.matricule) AS matricule, 
        COALESCE( m.nom, p.nom) AS nom, 
        COALESCE( m.prenom, p.prenom) AS prenom,
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
        defaultdb.Utilisateur u
      LEFT JOIN 
        defaultdb.Medecin m ON u.id = m.utilisateur_id
      LEFT JOIN 
        defaultdb.Patient p ON u.id = p.utilisateur_id
      WHERE
        u.email != 'ni.merzouk@esi-sba.dz'
    `;

    connection.query(query, (err, results) => {
      if (err) return reject("❌ Error fetching archived utilisateurs: " + err);
      resolve(results);
    });
  });
};

exports.changeUserPassword = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = "UPDATE Utilisateur SET password = ? WHERE email = ?";
      console.log(userData.email);
      connection.query(
        query,
        [userData.hashedPassword, userData.email],
        (err, result) => {
          if (err) return reject(err);

          if (result.affectedRows === 0) {
            return reject(new Error("No user found with this email."));
          }

          resolve({ message: "Password updated successfully." });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

exports.getAllPatients = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        p.matricule AS matricule,
        u.email, 
        p.nom AS nom, 
        p.prenom AS prenom
      FROM Utilisateur u
      JOIN Patient p ON u.id = p.utilisateur_id
    `;

    connection.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getActivePatients = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
     SELECT 
p.matricule AS matricule,
u.email, 
p.nom AS nom, 
p.prenom AS prenom
FROM Utilisateur u
LEFT JOIN Patient p ON u.id = p.utilisateur_id WHERE u.verified = 1
    `;

    connection.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getAllMedecins = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT m.archive , u.email, m.nom, m.prenom
      FROM Medecin m
      JOIN Utilisateur u ON m.utilisateur_id = u.id
     
    `;

    connection.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
        console.log("im here");
      }
    });
  });
};

exports.deleteUserByEmail = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Open MySQL connection
      if (!connection || connection.state === "disconnected") {
        return reject(new Error("Database connection is closed."));
      }

      // Promisify queries
      const query = util.promisify(connection.query).bind(connection);

      // Start transaction
      await query("START TRANSACTION");

      // Get user ID
      const [user] = await query("SELECT id FROM Utilisateur WHERE email = ?", [
        email,
      ]);
      if (!user) {
        await query("ROLLBACK");
        return reject(new Error("User not found."));
      }

      const userId = user.id;

      // Delete from related tables
      await query("DELETE FROM Medecin WHERE utilisateur_id = ?", [userId]);
      await query("DELETE FROM Patient WHERE utilisateur_id = ?", [userId]);

      // Delete from Utilisateur
      await query("DELETE FROM Utilisateur WHERE id = ?", [userId]);

      // Commit transaction
      await query("COMMIT");
      resolve(true);
    } catch (error) {
      await query("ROLLBACK");
      reject(error);
    }
  });
};

exports.saveUserProfile = async ({
  prenom,
  nom,
  email,
  num_tel,
  new_email,
}) => {
  return new Promise((resolve, reject) => {
    // SQL query to update Utilisateur table
    const sqlUpdateUtilisateur = `
      UPDATE Utilisateur 
      SET  
        email = COALESCE(?, email)
      WHERE email = ?;
    `;

    // Build the Patient update query dynamically based on provided fields
    let sqlUpdatePatient = `UPDATE Patient SET `;
    let values = [];

    // Dynamically add fields to the Patient update query only if they're provided
    if (nom !== undefined) {
      sqlUpdatePatient += `nom = ?, `;
      values.push(nom);
    }
    if (prenom !== undefined) {
      sqlUpdatePatient += `prenom = ?, `;
      values.push(prenom);
    }
    if (num_tel !== undefined) {
      sqlUpdatePatient += `num_tel = ?, `;
      values.push(num_tel);
    }

    // Remove trailing comma and space
    sqlUpdatePatient = sqlUpdatePatient.slice(0, -2);

    sqlUpdatePatient += ` WHERE utilisateur_id = (SELECT id FROM Utilisateur WHERE email = ?);`;

    // Ensure the email value is added for the WHERE clause
    values.push(email);

    console.log("Executing SQL for Utilisateur update:", sqlUpdateUtilisateur);
    console.log("Executing SQL for Patient update:", sqlUpdatePatient);

    // First, update the Utilisateur table
    connection.query(
      sqlUpdateUtilisateur,
      [new_email || email, email], // Use new_email if provided, otherwise use the current email
      (err, result) => {
        if (err) {
          console.error("Error in Utilisateur update query:", err);
          reject(err);
        } else {
          console.log(
            "Rows affected in Utilisateur update:",
            result.affectedRows
          );
          if (result.affectedRows > 0) {
            // If Utilisateur update is successful, update the Patient table
            connection.query(
              sqlUpdatePatient,
              values, // Dynamic values for Patient update query
              (patientErr, patientResult) => {
                if (patientErr) {
                  console.error("Error in Patient update query:", patientErr);
                  reject(patientErr);
                } else {
                  console.log(
                    "Rows affected in Patient update:",
                    patientResult.affectedRows
                  );
                  resolve(patientResult.affectedRows > 0);
                }
              }
            );
          } else {
            console.log("No rows affected in Utilisateur update.");
            resolve(false);
          }
        }
      }
    );
  });
};
exports.getUserProfile = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        u.id AS utilisateur_id,
        u.email,
        p.nom,
        p.prenom,
        p.num_tel
      FROM Utilisateur u
      INNER JOIN Patient p ON u.id = p.utilisateur_id
      WHERE u.email = ?;
    `;

    connection.query(sql, [email], (err, results) => {
      if (err) {
        console.error("Error fetching user profile:", err);
        reject(err);
      } else if (results.length === 0) {
        resolve(null);
      } else {
        resolve(results[0]);
      }
    });
  });
};

exports.getUserRoleByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const getUserIdSql = "SELECT id FROM Utilisateur WHERE email = ?";

    connection.query(getUserIdSql, [email], (err, users) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return reject(err);
      }

      if (users.length === 0) {
        return resolve(null);
      }

      const userId = users[0].id;

      const roleChecks = [
        { table: "Medecin", role: "medecin" },
        { table: "Admin", role: "admin" },
        { table: "AideSoignant", role: "aide_soignant" },
      ];

      // First check Patient separately because it needs special logic
      const patientSql =
        "SELECT categorie FROM Patient WHERE utilisateur_id = ? LIMIT 1";

      connection.query(patientSql, [userId], (err, rows) => {
        if (err) {
          console.error("Error checking patient role:", err);
          return reject(err);
        }

        if (rows.length > 0) {
          const categorie = rows[0].categorie;
          if (categorie === "Directeur") {
            return resolve("directeur");
          } else {
            return resolve("patient");
          }
        }

        // If not a patient, check the other roles
        const checkNextRole = (index) => {
          if (index >= roleChecks.length) {
            return resolve(null); // No role found
          }

          const { table, role } = roleChecks[index];
          const roleQuery = `SELECT 1 FROM ${table} WHERE utilisateur_id = ? LIMIT 1`;

          connection.query(roleQuery, [userId], (err, rows) => {
            if (err) {
              console.error(`Error checking ${role} role:`, err);
              return reject(err);
            }

            if (rows.length > 0) {
              return resolve(role);
            } else {
              checkNextRole(index + 1);
            }
          });
        };

        checkNextRole(0); // Begin checking other roles
      });
    });
  });
};
/*
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Déclaration du modèle Patient
const Patient = sequelize.define("Patient", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categorie: {
    type: DataTypes.ENUM("Etudiant", "ATS", "Enseignant", "Directeur"),
    allowNull: false,
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nom: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  num_tel: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: "Patient",
  timestamps: false,
});


// ✅ Ajout de la méthode findByMatricule (avec query SQL brut si tu n'utilises pas Sequelize pour CRUD)

const db = connection.promise();

Patient.findByMatricule = async function(matricule) {
  const [rows] = await db.execute(
    "SELECT * FROM Patient WHERE matricule = ?",
    [matricule]
  );
  return rows.length > 0 ? rows[0] : null;
};

module.exports = Patient;
*/