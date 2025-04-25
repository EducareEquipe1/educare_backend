
const connection = require("../db");
const db = connection.promise();

const Demande = {
  create: async (id_patient, motif) => {
    const [result] = await db.execute(
      "INSERT INTO demande (id_patient, motif, date_depot) VALUES (?, ?, NOW())",
      [id_patient, motif]
    );
    return result.insertId;
  }
};

module.exports = Demande;
