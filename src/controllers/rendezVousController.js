// 📁 controllers/rendezvousController.js
const Demande = require("../models/demandeModel");
const RendezVous = require("../models/rendezVousModel");
const connection = require("../db");

const db = connection.promise();
const { doctorMiddleware } = require("../middlewares/authMiddleware");

// demanderRendezVous
exports.demanderRendezVous = async (req, res) => {
    const { motif } = req.body;
    const { email } = req.params;
  
    try {
      // 1. Trouver l'utilisateur
      const [utilisateur] = await db.query(
        "SELECT id FROM Utilisateur WHERE email = ?",
        [email]
      );
  
      if (utilisateur.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
  
      const id_utilisateur = utilisateur[0].id;
  
      // 2. Trouver le patient correspondant
      const [patient] = await db.query(
        "SELECT id FROM Patient WHERE utilisateur_id = ?",
        [id_utilisateur]
      );
  
      if (patient.length === 0) {
        return res.status(404).json({ error: "Aucun patient lié à cet utilisateur" });
      }
  
      const id_patient = patient[0].id;
  
      // 3. Créer la demande
      const id_demande = await Demande.create(id_patient, motif);
      console.log("ID de la demande insérée :", id_demande);
  
      // 4. Créer le rendez-vous lié avec motif + patient
      const id_rdv = await RendezVous.create(id_patient, id_demande, motif);
  
      res.status(201).json({ message: "Rendez-vous demandé", id_rdv });
    } catch (error) {
      console.error("Erreur lors de la demande de rendez-vous:", error);
      res.status(500).json({ error: `Erreur lors de la demande de rendez-vous: ${error.message}` });
    }
  };
  
  
   
  exports.programmerRendezVous = async (req, res) => {
    const { id_rdv } = req.params;
    const { date_rdv, heure_rdv, type_consultation } = req.body;
  
    try {
      // 1. Récupérer le rendez-vous
      const [rows] = await db.execute(
        "SELECT statut FROM rendezVous WHERE id_rendezVous = ?",
        [id_rdv]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Rendez-vous introuvable" });
      }
  
      const statut = rows[0].statut;
  
      // 2. Vérifier si déjà annulé ou terminé
      if (statut === "annulé") {
        return res.status(400).json({ error: "Ce rendez-vous a été annulé, il ne peut pas être programmé." });
      }
  
      if (statut === "terminé") {
        return res.status(400).json({ error: "Ce rendez-vous a été terminé, il ne peut pas être reprogrammé." });
      }
  
      // 3. Programmer le rendez-vous
      await RendezVous.programmer(id_rdv, date_rdv, heure_rdv, type_consultation);
  
      res.status(200).json({ message: "Rendez-vous programmé avec succès." });
    } catch (error) {
      console.error("Erreur lors de la programmation du rendez-vous:", error);
      res.status(500).json({ error: "Erreur lors de la programmation du rendez-vous." });
    }
  };
  
  exports.programmerRendezVousParMedecin = async (req, res) => {
    const { email } = req.params; // Email passé dans l'URL
    const { date_rdv, heure_rdv, motif } = req.body;
  
    try {
      // 1. Vérification des champs requis
      if (!date_rdv || !heure_rdv || !motif) {
        return res.status(400).json({ error: "Les champs date, heure et motif sont requis." });
      }
  
      // 2. Récupérer l'utilisateur par email
      const [utilisateurRows] = await db.execute(
        "SELECT id FROM Utilisateur WHERE email = ?",
        [email]
      );
  
      if (utilisateurRows.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }
  
      const id_utilisateur = utilisateurRows[0].id;
  
      // 3. Récupérer le patient lié à cet utilisateur
      const [patientRows] = await db.execute(
        "SELECT id FROM Patient WHERE utilisateur_id = ?",
        [id_utilisateur]
      );
  
      if (patientRows.length === 0) {
        return res.status(404).json({ error: "Aucun patient lié à cet utilisateur." });
      }
  
      const id_patient = patientRows[0].id;
  
      // 4. Créer le rendez-vous avec statut "programmé"
      const [result] = await db.execute(
        "INSERT INTO rendezVous (id_patient, date, heure, motif, statut) VALUES (?, ?, ?, ?, 'programmé')",
        [id_patient, date_rdv, heure_rdv, motif]
      );
  
      const id_rdv = result.insertId;
  
      res.status(201).json({
        message: "Rendez-vous programmé avec succès par le médecin.",
        id_rdv
      });
  
    } catch (error) {
      console.error("Erreur lors de la programmation par le médecin:", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  };
  

exports.annulerRendezVous = async (req, res) => {
    const { id_rdv } = req.params;
    try {
      await RendezVous.annuler(id_rdv);
      res.status(200).json({ message: "Rendez-vous annulé" });
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      res.status(500).json({ error: "Erreur lors de l'annulation" });
    }
  };
  

exports.terminerRendezVous = async (req, res) => {
  const { id_rdv } = req.params;
  try {
    await RendezVous.terminer(id_rdv);
    res.status(200).json({ message: "Rendez-vous termin\u00e9" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la terminaison" });
  }
};

exports.getConsultation = async (req, res) => {
  const { id_rdv } = req.params;
  try {
    const details = await RendezVous.getConsultationDetails(id_rdv);
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la r\u00e9cup\u00e9ration de la consultation" });
  }
};
 
// refuser un rendez vous
exports.refuserRendezVous = async (req, res) => {
    const { id_rdv } = req.params;
  
    try {
      // Vérifier si le rendez-vous existe et est en statut "demandé"
      const [rdv] = await db.execute(
        "SELECT statut FROM rendezVous WHERE id_rendezVous = ?",
        [id_rdv]
      );
  
      if (rdv.length === 0) {
        return res.status(404).json({ error: "Rendez-vous introuvable" });
      }
  
      if (rdv[0].statut !== "demandé") {
        return res.status(400).json({ error: "Seuls les rendez-vous en statut 'demandé' peuvent être refusés" });
      }
  
      // Mettre à jour le statut à "refusé"
      await db.execute(
        "UPDATE rendezVous SET statut = 'refusé' WHERE id_rendezVous = ?",
        [id_rdv]
      );
  
      res.status(200).json({ message: "Rendez-vous refusé" });
    } catch (error) {
      console.error("Erreur lors du refus du rendez-vous:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
  
//liste des rendez-vous
exports.listeRendezVous = async (req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM rendezVous WHERE statut IN ('programmé', 'annulé', 'terminé')"
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous filtrés:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des rendez-vous." });
    }
  };

  //liste des demandes
  exports.listeDemandesRendezVous = async (req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM demande "
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes de rendez-vous:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des demandes." });
    }
  };
  