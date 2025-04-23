const connection = require("../db.js");

exports.searchPatientsByName = async (q) => {
  const likeQuery = `%${q}%`;

  const query = `
    SELECT 
      u.email,
      p.nom AS nom,
      p.prenom AS prenom
    FROM Patient p
    JOIN Utilisateur u ON p.utilisateur_id = u.id
    WHERE p.nom LIKE ? OR p.prenom LIKE ?

    UNION

    SELECT 
      u.email,
      d.nom AS nom,
      d.prenom AS prenom
    FROM Directeur d
    JOIN Utilisateur u ON d.utilisateur_id = u.id
    WHERE d.nom LIKE ? OR d.prenom LIKE ?
  `;

  return new Promise((resolve, reject) => {
    connection.query(
      query,
      [likeQuery, likeQuery, likeQuery, likeQuery],
      (err, results) => {
        if (err) return reject("❌ Error fetching utilisateurs: " + err);
        resolve(results);
      }
    );
  });
};
exports.searchUtilisateursByNameOrEmail = async (q) => {
  const likeQuery = `%${q}%`;
  const excludedEmail = 'ni.merzouk@esi-sba.dz';

  const query = `
    SELECT u.email, p.nom, p.prenom
    FROM Patient p
    JOIN Utilisateur u ON p.utilisateur_id = u.id
    WHERE (p.nom LIKE ? OR p.prenom LIKE ? OR u.email LIKE ?)
      AND u.email != ?

    UNION

    SELECT u.email, d.nom, d.prenom
    FROM Directeur d
    JOIN Utilisateur u ON d.utilisateur_id = u.id
    WHERE (d.nom LIKE ? OR d.prenom LIKE ? OR u.email LIKE ?)
      AND u.email != ?

    UNION

    SELECT u.email, m.nom, m.prenom
    FROM Medecin m
    JOIN Utilisateur u ON m.utilisateur_id = u.id
    WHERE (m.nom LIKE ? OR m.prenom LIKE ? OR u.email LIKE ?)
      AND u.email != ?
  `;

  const params = [
    likeQuery, likeQuery, likeQuery, excludedEmail,
    likeQuery, likeQuery, likeQuery, excludedEmail,
    likeQuery, likeQuery, likeQuery, excludedEmail
  ];

  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) return reject("❌ Error searching utilisateurs: " + err);
      resolve(results);
    });
  });
};