const connection = require("../db"); // Import the database connection
const bcrypt = require("bcrypt");

// ✅ Find Patient by Email
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

// ✅ Update pation activation
exports.updatePatientActivation = async (email) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE Utilisateur SET is_active = ? WHERE email = ?";
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

// ✅ Create a new patient (Register Patient)
exports.createPatient = (patientData, userType) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) return reject(err);
      const is_active =
        userType === "Admin" || userType === "Medecin" ? true : false;

      const userSql = `
        INSERT INTO Utilisateur (email, last_name, first_name, password, birth_date, phone , is_active)
        VALUES (?, ?, ?, ?, ?, ? , ?);
      `;

      const values = [
        patientData.email,
        patientData.last_name,
        patientData.first_name,
        patientData.password,
        patientData.birth_date,
        patientData.phone,
        is_active,
      ];

      connection.query(userSql, values, (err, result) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }

        const utilisateurId = result.insertId;
        let userTypeSql;
        let typeValues;

        if (userType === "Patient") {
          userTypeSql = `INSERT INTO Patient (utilisateur_id, matricule) VALUES (?, ?);`;
        } else if (userType === "Medecin") {
          userTypeSql = `INSERT INTO Medecin (utilisateur_id, matricule) VALUES (?, ?);`;
        } else if (userType === "Admin") {
          userTypeSql = `INSERT INTO Admin (utilisateur_id, matricule) VALUES (?, ?);`;
        } else {
          return connection.rollback(() =>
            reject(new Error("Invalid userType"))
          );
        }

        typeValues = [utilisateurId, patientData.matricule]; // `matricule` is stored in these tables

        connection.query(userTypeSql, typeValues, (err, result) => {
          if (err) {
            return connection.rollback(() => reject(err));
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => reject(err));
            }

            resolve({
              utilisateurId,
              userTypeId: result.insertId,
            });
          });
        });
      });
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

exports.getActivePatients = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.matricule ,p.role, u.email, u.last_name, u.first_name
      FROM Patient p
      JOIN Utilisateur u ON p.utilisateur_id = u.id
      WHERE u.is_active = 1
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

exports.getAllPatients = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.matricule ,p.role, u.email, u.last_name, u.first_name
      FROM Patient p
      JOIN Utilisateur u ON p.utilisateur_id = u.id
     
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

exports.getAllMedecins = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT m.state ,m.role, u.email, u.last_name, u.first_name
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
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM Medecin WHERE utilisateur_id = (SELECT id FROM Utilisateur WHERE email = ?);
      DELETE FROM Patient WHERE utilisateur_id = (SELECT id FROM Utilisateur WHERE email = ?);
      DELETE FROM Utilisateur WHERE email = ?;
    `;

    connection.query(sql, [email, email, email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

exports.editMedecinStateByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Medecin 
      SET state = NOT state 
      WHERE utilisateur_id = (SELECT id FROM Utilisateur WHERE email = ?);
    `;

    connection.query(sql, [email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
};
