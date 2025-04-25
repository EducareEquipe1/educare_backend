const connection = require("../db");
const db = connection.promise();

const RendezVous = {
  create: async (id_patient, id_demande, motif) => {
    console.log("→ Données pour insertion rendezVous :", {
      id_patient: typeof id_patient,
      id_demande: typeof id_demande,
      motif: typeof motif,
    });
    console.log("→ Valeurs :", id_patient, id_demande, motif);

    const [result] = await db.execute(
      "INSERT INTO rendezVous (id_patient, id_demande, motif, statut) VALUES (?, ?, ?, 'demandé')",
      [id_patient, id_demande, motif]
    );

    return result.insertId;
  },

  programmer: async (id_rdv, date_rdv, heure_rdv) => {
    await db.execute(
      "UPDATE rendezVous SET date = ?, heure = ? , statut = 'programmé' WHERE id_rendezVous = ?",
      [date_rdv, heure_rdv, id_rdv]
    );
  },

  annuler: async (id_rdv) => {
    await db.execute(
      "UPDATE rendezVous SET statut = 'annulé' WHERE id_rendezVous = ?",
      [id_rdv]
    );
  },

  terminer: async (id_rdv) => {
    await db.execute(
      "UPDATE rendezVous SET statut = 'terminé' WHERE id_rendezVous = ?",
      [id_rdv]
    );
  },

  getConsultationDetails: async (id_rdv) => {
    const [rows] = await db.execute(
      "SELECT * FROM Consultation WHERE id_rendezVous = ?",
      [id_rdv]
    );
    return rows[0];
  },
};

module.exports = RendezVous;
