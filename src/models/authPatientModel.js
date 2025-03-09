const connection = require("../db"); // Import the database connection
const bcrypt = require("bcrypt");

// ✅ Find Patient by Email
exports.findPatientByEmail = async (email) => {
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
exports.createPatient = (patientData) => {
  return new Promise((resolve, reject) => {
    const userSql = `
            INSERT INTO Utilisateur (email, last_name, first_name, password, birth_date, phone)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

    const patientSql = `
            INSERT INTO Patient (utilisateur_id, matricule) VALUES (?, ?);
        `;

    const values = [
      patientData.email,
      patientData.last_name,
      patientData.first_name,
      patientData.password,
      patientData.birth_date,
      patientData.phone,
    ];

    connection.query(userSql, values, (err, result) => {
      if (err) return reject(err);

      const utilisateurId = result.insertId;
      const matricule = patientData.matricule || null;

      connection.query(
        patientSql,
        [utilisateurId, matricule],
        (err, patientResult) => {
          if (err) return reject(err);
          resolve({
            utilisateurId,
            patientId: patientResult.insertId,
            matricule,
          });
        }
      );
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
