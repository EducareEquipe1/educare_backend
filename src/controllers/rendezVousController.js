// 📁 controllers/rendezvousController.js
const Demande = require("../models/demandeModel");
const RendezVous = require("../models/rendezVousModel");
const connection = require("../db");
const db = connection.promise();
const { doctorMiddleware } = require("../middlewares/authMiddleware");

const fs = require("fs");
const xlsx = require("xlsx");

const extractUsersFromText = require("../utils/pdfParser");
const Patient = require("../models/authPatientModel");

const { Op } = require("sequelize");
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
      return res
        .status(404)
        .json({ error: "Aucun patient lié à cet utilisateur" });
    }

    const id_patient = patient[0].id;

    // 3. Créer la demande avec date_depot = aujourd'hui
    const currentDate = new Date().toISOString().split("T")[0]; // format "YYYY-MM-DD"

    const [demandeResult] = await db.execute(
      "INSERT INTO demande (id_patient, motif, date_depot) VALUES (?, ?, ?)",
      [id_patient, motif, currentDate]
    );

    const id_demande = demandeResult.insertId;
    console.log("ID de la demande insérée :", id_demande);

    // 4. Créer le rendez-vous lié avec motif + patient + email
    const id_rdv = await RendezVous.create(
      id_patient,
      id_demande,
      motif,
      email
    );

    res.status(201).json({ message: "Rendez-vous demandé", id_rdv });
  } catch (error) {
    console.error("Erreur lors de la demande de rendez-vous:", error);
    res.status(500).json({
      error: `Erreur lors de la demande de rendez-vous: ${error.message}`,
    });
  }
};

exports.programmerRendezVous = async (req, res) => {
  const { id_rdv } = req.params;
  const { email, nom, prenom, date_rdv, heure_rdv } = req.body;

  try {
    const [rdvRows] = await db.execute(
      "SELECT statut FROM rendezVous WHERE id_rendezVous = ?",
      [id_rdv]
    );

    if (rdvRows.length === 0) {
      return res.status(404).json({ error: "Rendez-vous introuvable." });
    }

    const rdv = rdvRows[0];

    if (rdv.statut !== "demandé") {
      return res
        .status(400)
        .json({ error: "Ce rendez-vous n'est pas en statut demandé." });
    }

    const [userRows] = await db.execute(
      "SELECT id FROM Utilisateur WHERE email = ?",
      [email]
    );
    console.log(email);
    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Utilisateur (patient) non trouvé." });
    }

    const id_utilisateur = userRows[0].id;

    const [patientRows] = await db.execute(
      "SELECT id FROM Patient WHERE utilisateur_id = ?",
      [id_utilisateur]
    );

    if (patientRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Patient non trouvé pour cet utilisateur." });
    }

    const id_patient = patientRows[0].id;

    // 🔍 Vérifier qu'aucun autre rendez-vous n'est déjà programmé à cette date/heure
    const [existingRdvRows] = await db.execute(
      "SELECT id_rendezVous FROM rendezVous WHERE date = ? AND heure = ? AND id_rendezVous != ?",
      [date_rdv, heure_rdv, id_rdv]
    );

    if (existingRdvRows.length > 0) {
      return res.status(400).json({
        error: "Un autre rendez-vous est déjà programmé à cette date et heure.",
      });
    }

    // ✅ Mise à jour du rendez-vous
    await RendezVous.programmer(id_rdv, date_rdv, heure_rdv);

    res.status(200).json({ message: "Rendez-vous programmé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la programmation du rendez-vous:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

exports.programmerRendezVousParMedecin = async (req, res) => {
  const { email } = req.params; // Email passé dans l'URL
  const { date_rdv, heure_rdv, motif } = req.body;

  try {
    // 1. Vérification des champs requis
    if (!date_rdv || !heure_rdv || !motif) {
      return res
        .status(400)
        .json({ error: "Les champs date, heure et motif sont requis." });
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
      return res
        .status(404)
        .json({ error: "Aucun patient lié à cet utilisateur." });
    }

    const id_patient = patientRows[0].id;

    // 4. Vérifier s'il existe déjà un rendez-vous à la même date et heure
    const [existingRdvRows] = await db.execute(
      "SELECT id_rendezVous FROM rendezVous WHERE date = ? AND heure = ?",
      [date_rdv, heure_rdv]
    );

    if (existingRdvRows.length > 0) {
      return res.status(400).json({
        error: "Un rendez-vous existe déjà à cette date et cette heure.",
      });
    }

    // 5. Créer le rendez-vous avec statut "programmé"
    const [result] = await db.execute(
      "INSERT INTO rendezVous (id_patient, date, heure, motif, statut, email) VALUES (?, ?, ?, ?, 'programmé', ?)",
      [id_patient, date_rdv, heure_rdv, motif, email]
    );

    const id_rdv = result.insertId;

    // Notification
    await db.execute(
      "INSERT INTO Notification (user_email, title, content, type) VALUES (?, ?, ?, ?)",
      [
        email, // email du patient
        "Nouveau rendez-vous",
        `Votre rendez-vous du ${date_rdv} à ${heure_rdv} a été programmé par le médecin.`,
        "scheduled", // <-- use allowed value
      ]
    );

    res.status(201).json({
      message: "Rendez-vous programmé avec succès par le médecin.",
      id_rdv,
    });
  } catch (error) {
    console.error("Erreur lors de la programmation par le médecin:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Programmer un rendez-vous depuis le bouton ajouter du calendrier
exports.programmerDirectementRendezVous = async (req, res) => {
  const { email, date_rdv, heure_rdv, motif, nom, prenom } = req.body;

  try {
    // 1. Vérifier que l'utilisateur existe
    const [userRows] = await db.execute(
      "SELECT id FROM Utilisateur WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Utilisateur (patient) non trouvé." });
    }

    const id_utilisateur = userRows[0].id;

    // 2. Vérifier que c'est bien un patient
    const [patientRows] = await db.execute(
      "SELECT id FROM Patient WHERE utilisateur_id = ?",
      [id_utilisateur]
    );

    if (patientRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Patient non trouvé pour cet utilisateur." });
    }

    const id_patient = patientRows[0].id;

    // 3. Vérifier s'il existe déjà un rendez-vous à cette date et heure
    const [existingRdvRows] = await db.execute(
      "SELECT id_rendezVous FROM rendezVous WHERE date = ? AND heure = ?",
      [date_rdv, heure_rdv]
    );

    if (existingRdvRows.length > 0) {
      return res.status(400).json({
        error: "Un rendez-vous est déjà programmé à cette date et heure.",
      });
    }

    // 4. Créer directement le rendez-vous
    const [result] = await db.execute(
      "INSERT INTO rendezVous (id_patient, date, heure, motif, statut, email) VALUES (?, ?, ?, ?, 'programmé', ?)",
      [id_patient, date_rdv, heure_rdv, motif, email]
    );

    const id_rdv = result.insertId;

    // Notification
    await db.execute(
      "INSERT INTO Notification (user_email, title, content, type) VALUES (?, ?, ?, ?)",
      [
        email, // email du patient
        "Nouveau rendez-vous",
        `Votre rendez-vous du ${date_rdv} à ${heure_rdv} a été programmé.`,
        "scheduled",
      ]
    );

    res.status(201).json({
      message: "Rendez-vous programmé avec succès par le médecin.",
      id_rdv,
      patient: {
        nom,
        prenom,
        email,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la programmation directe du rendez-vous:",
      error
    );
    res.status(500).json({ error: "Erreur serveur." });
  }
};
/*
  exports.modifierRendezVous = async (req, res) => {
    const { id_rendezVous } = req.params;
    const { date_rdv, heure_rdv, motif,statut } = req.body;
  
    try {
      // Vérifier si le rendez-vous existe
      const [rendezVousRows] = await db.execute(
        "SELECT * FROM rendezVous WHERE id_rendezVous = ?",
        [id_rendezVous]
      );
  
      if (rendezVousRows.length === 0) {
        return res.status(404).json({ error: "Rendez-vous introuvable." });
      }
  
      const rdv = rendezVousRows[0];
  
      // Interdire la modification si annulé ou terminé
      if (rdv.statut === "annulé" || rdv.statut === "terminé") {
        return res.status(400).json({ error: `Impossible de modifier un rendez-vous ${rdv.statut}.` });
      }
  
      // Vérifier si au moins un champ est fourni
      if (!date_rdv && !heure_rdv && !motif) {
        return res.status(400).json({ error: "Veuillez fournir au moins une nouvelle date, une nouvelle heure, ou un nouveau motif." });
      }
  
      // Préparer les valeurs à mettre à jour
      const updateFields = [];
      const updateValues = [];
  
      if (date_rdv) {
        updateFields.push("date = ?");
        updateValues.push(date_rdv);
      }
  
      if (heure_rdv) {
        updateFields.push("heure = ?");
        updateValues.push(heure_rdv);
      }
  
      if (motif) {
        updateFields.push("motif = ?");
        updateValues.push(motif);
      }
  
      // Ajout de l'id du rendez-vous pour l'update
      updateValues.push(id_rendezVous);
  
      // Mettre à jour les champs spécifiés
      await db.execute(
        `UPDATE rendezVous SET ${updateFields.join(", ")} WHERE id_rendezVous = ?`,
        updateValues
      );
  
      res.status(200).json({ message: "Rendez-vous modifié avec succès." });
  
    } catch (error) {
      console.error("Erreur lors de la modification du rendez-vous:", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  };
  
*/

exports.annulerRendezVous = async (req, res) => {
  const { id_rdv } = req.params;
  try {
    // Get patient email before cancelling
    const [rows] = await db.execute(
      `SELECT u.email, r.date, r.heure
       FROM rendezVous r
       INNER JOIN Patient p ON r.id_patient = p.id
       INNER JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE r.id_rendezVous = ?`,
      [id_rdv]
    );
    let patientEmail = null,
      date = null,
      heure = null;
    if (rows.length > 0) {
      patientEmail = rows[0].email;
      date = rows[0].date;
      heure = rows[0].heure;
    }

    await RendezVous.annuler(id_rdv);

    // Notify patient
    if (patientEmail) {
      await notifyUser({
        user_email: patientEmail,
        title: "Rendez-vous annulé",
        content: `Votre rendez-vous du ${date ?? ""} à ${
          heure ?? ""
        } a été annulé par le médecin.`,
        type: "refused", // <-- use allowed value
      });
    }

    res.status(200).json({ message: "Rendez-vous annulé" });
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    res.status(500).json({ error: "Erreur lors de l'annulation" });
  }
};

/*
exports.terminerRendezVous = async (req, res) => {
  const { id_rdv } = req.params;
  try {
    await RendezVous.terminer(id_rdv);
    res.status(200).json({ message: "Rendez-vous termin\u00e9" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la terminaison" });
  }
}; */
exports.modifierRendezVous = async (req, res) => {
  const { id_rendezVous } = req.params;
  const { date_rdv, heure_rdv, motif, statut } = req.body;

  try {
    const [rendezVousRows] = await db.execute(
      "SELECT * FROM rendezVous WHERE id_rendezVous = ?",
      [id_rendezVous]
    );

    if (rendezVousRows.length === 0) {
      return res.status(404).json({ error: "Rendez-vous introuvable." });
    }

    const rdv = rendezVousRows[0];

    if (rdv.statut === "annulé" || rdv.statut === "terminé") {
      return res.status(400).json({
        error: `Impossible de modifier un rendez-vous ${rdv.statut}.`,
      });
    }

    // Préparer la mise à jour dynamique
    const updateFields = [];
    const updateValues = [];

    if (date_rdv !== undefined) {
      updateFields.push("date = ?");
      updateValues.push(date_rdv);
    }

    if (heure_rdv !== undefined) {
      updateFields.push("heure = ?");
      updateValues.push(heure_rdv);
    }

    if (motif !== undefined) {
      updateFields.push("motif = ?");
      updateValues.push(motif);
    }

    if (statut !== undefined) {
      updateFields.push("statut = ?");
      updateValues.push(statut);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error:
          "Aucun champ valide à modifier. Veuillez fournir au moins un champ : date, heure, motif ou statut.",
      });
    }

    updateValues.push(id_rendezVous);

    await db.execute(
      `UPDATE rendezVous SET ${updateFields.join(
        ", "
      )} WHERE id_rendezVous = ?`,
      updateValues
    );

    res.status(200).json({
      message: "Rendez-vous modifié avec succès.",
      champs_modifiés: updateFields.map((f) => f.split(" = ")[0]),
    });
  } catch (error) {
    console.error("Erreur lors de la modification du rendez-vous:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
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
      return res.status(400).json({
        error: "Seuls les rendez-vous en statut 'demandé' peuvent être refusés",
      });
    }

    // Mettre à jour le statut à "refusé"
    await db.execute(
      "UPDATE rendezVous SET statut = 'refusé' WHERE id_rendezVous = ?",
      [id_rdv]
    );

    // Get patient info for notification
    const [infoRows] = await db.execute(
      `SELECT u.email, r.date, r.heure
       FROM rendezVous r
       INNER JOIN Patient p ON r.id_patient = p.id
       INNER JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE r.id_rendezVous = ?`,
      [id_rdv]
    );
    if (infoRows.length > 0) {
      await notifyUser({
        user_email: infoRows[0].email,
        title: "Rendez-vous refusé",
        content: `Votre rendez-vous du ${infoRows[0].date ?? ""} à ${
          infoRows[0].heure ?? ""
        } a été refusé par le médecin.`,
        type: "refused", // <-- use allowed value
      });
    }

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
      `
      SELECT 
        p.nom, 
        p.prenom, 
        u.email,      
        r.date, 
        r.heure, 
        r.statut,
        r.motif,
        r.id_rendezVous
      FROM 
        rendezVous r
      INNER JOIN 
        Patient p ON r.id_patient = p.id
      INNER JOIN 
        Utilisateur u ON p.utilisateur_id = u.id  
      WHERE 
        r.statut IN ('programmé', 'annulé', 'terminé')
      ORDER BY 
        r.date ASC, r.heure ASC
      `
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous filtrés:",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des rendez-vous." });
  }
};

// Liste des rendez-vous demandés
exports.listeRendezVousDemandes = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        r.motif,
        d.date_depot,
        p.nom,
        p.prenom,
        r.id_rendezVous,
        u.email
      FROM 
        rendezVous r
      JOIN 
        demande d ON r.id_demande = d.id_demande
      JOIN 
        Patient p ON r.id_patient = p.id
        INNER JOIN 
        Utilisateur u ON p.utilisateur_id = u.id  
      
     
      WHERE 
        r.statut = 'demandé'
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous demandés:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des rendez-vous demandés.",
    });
  }
};

// liste des rendez-vous d'un seul patient
exports.getRendezVousByPatientEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // Récupérer les rendez-vous en utilisant l'email du patient
    const [rendezVousRows] = await db.execute(
      `SELECT r.date, r.motif, r.heure, r.statut
       FROM rendezVous r
       INNER JOIN Patient p ON r.id_patient = p.id
       INNER JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE u.email = ?
       ORDER BY r.date DESC`,
      [email]
    );

    res.status(200).json(rendezVousRows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rendez-vous du patient:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des rendez-vous.",
    });
  }
};

// Get the next upcoming rendez-vous for a patient (for countdown)
exports.getNextRendezVousByPatientEmail = async (req, res) => {
  const { email } = req.params;
  try {
    // Only future appointments, status = 'programmé'
    const [rows] = await db.execute(
      `SELECT r.date, r.heure, r.motif, r.statut
       FROM rendezVous r
       INNER JOIN Patient p ON r.id_patient = p.id
       INNER JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE u.email = ? AND r.statut = 'programmé'
         AND CONCAT(r.date, ' ', r.heure) >= NOW()
       ORDER BY r.date ASC, r.heure ASC
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucun rendez-vous à venir." });
    }

    // Combine date and heure into a single ISO string for frontend
    const rdv = rows[0];
    const dateTimeStr = `${rdv.date}T${
      rdv.heure.length === 5 ? rdv.heure : rdv.heure.slice(0, 5)
    }`;
    res.status(200).json({
      date: rdv.date,
      heure: rdv.heure,
      motif: rdv.motif,
      statut: rdv.statut,
      dateTime: dateTimeStr, // For easier parsing in Flutter
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du prochain rendez-vous:",
      error
    );
    res
      .status(500)
      .json({
        error:
          "Erreur serveur lors de la récupération du prochain rendez-vous.",
      });
  }
};

// liste des demandes de rendez-vous d'un seul patient
exports.getDemandesRendezVousByPatientEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // 1. Trouver l'utilisateur via son email
    const [utilisateurRows] = await db.execute(
      "SELECT id FROM Utilisateur WHERE email = ?",
      [email]
    );

    if (utilisateurRows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const utilisateur_id = utilisateurRows[0].id;

    // 2. Trouver le patient lié à cet utilisateur
    const [patientRows] = await db.execute(
      "SELECT id FROM Patient WHERE utilisateur_id = ?",
      [utilisateur_id]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé." });
    }

    const patient_id = patientRows[0].id;

    // 3. Récupérer les rendez-vous demandés, uniquement motif et date_depot
    const [demandesRows] = await db.execute(
      `SELECT d.motif, d.date_depot
       FROM demande d
       INNER JOIN rendezVous r ON d.id_demande = r.id_demande
       WHERE r.id_patient = ? AND r.statut = 'demandé'
       ORDER BY d.date_depot DESC`,
      [patient_id]
    );

    res.status(200).json(demandesRows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de rendez-vous du patient:",
      error
    );
    res.status(500).json({
      message:
        "Erreur serveur lors de la récupération des demandes de rendez-vous.",
    });
  }
};

// Annuler une demande non programmée (par le patient)
exports.annulerDemandeNonProgramme = async (req, res) => {
  const { email, id_rdv } = req.params;

  try {
    // 1. Vérifier que le rendez-vous existe et est en statut "demandé"
    const [rdvRows] = await db.execute(
      "SELECT id_patient, statut FROM rendezVous WHERE id_rendezVous = ?",
      [id_rdv]
    );

    if (rdvRows.length === 0) {
      return res.status(404).json({ error: "Rendez-vous introuvable." });
    }

    const rdv = rdvRows[0];

    if (rdv.statut !== "demandé") {
      return res.status(400).json({
        error: "Seules les demandes non programmées peuvent être annulées.",
      });
    }

    // 2. Vérifier que le rendez-vous appartient bien au patient identifié par l'email
    const [userRows] = await db.execute(
      "SELECT id FROM Utilisateur WHERE email = ?",
      [email]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const id_utilisateur = userRows[0].id;

    const [patientRows] = await db.execute(
      "SELECT id FROM Patient WHERE utilisateur_id = ?",
      [id_utilisateur]
    );
    if (patientRows.length === 0 || patientRows[0].id !== rdv.id_patient) {
      return res
        .status(403)
        .json({ error: "Ce rendez-vous ne vous appartient pas." });
    }

    // 3. Supprimer le rendez-vous
    await db.execute("DELETE FROM rendezVous WHERE id_rendezVous = ?", [
      id_rdv,
    ]);

    res
      .status(200)
      .json({ message: "Demande de rendez-vous annulée avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'annulation de la demande:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

exports.bullkScheduleAppointmentsFromExcel = async (req, res) => {
  try {
    const filePath = req.file.path;

    // 📥 Lecture du fichier Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const { startDate, interval } = req.body;

    if (!startDate || !interval) {
      return res
        .status(400)
        .json({ error: "startDate et interval sont requis" });
    }

    let dateCursor = new Date(startDate);
    const intervalMinutes = parseInt(interval);
    dateCursor.setHours(8, 0, 0, 0);

    const results = [];

    // ⏭ Sauter la première ligne (en-tête)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const email = row[2]?.toString().trim(); // 📌 Colonne 3 (index 2)

      if (!email) {
        results.push({
          email: null,
          status: "failed",
          error: "Email manquant",
        });
        continue;
      }

      const patient = await Patient.findPatientByEmail(email);

      if (!patient) {
        results.push({ email, status: "failed", error: "Patient introuvable" });
        continue;
      }

      // ⛔ Sauter vendredi (5) et samedi (6)
      while ([5, 6].includes(dateCursor.getDay())) {
        dateCursor.setDate(dateCursor.getDate() + 1);
        dateCursor.setHours(8, 0, 0, 0);
      }

      const hour = dateCursor.getHours();

      // ⏳ Sauter la pause de midi
      if (hour >= 12 && hour < 14) {
        dateCursor.setHours(14, 0, 0, 0);
      }

      // ⏭ Passer au jour suivant si après 16h
      if (hour >= 16) {
        dateCursor.setDate(dateCursor.getDate() + 1);
        dateCursor.setHours(8, 0, 0, 0);
        continue;
      }

      const fullDate = new Date(dateCursor);
      const dateSQL = fullDate.toISOString().split("T")[0];
      const heureSQL = fullDate.toTimeString().split(":").slice(0, 2).join(":");
      const motif = "contrôle médical";

      try {
        await db.execute(
          `INSERT INTO rendezVous (id_patient, date, heure, statut, email, motif) VALUES (?, ?, ?, ?, ?, ?)`,
          [patient.id, dateSQL, heureSQL, "programmé", email, motif]
        );

        results.push({
          email,
          status: "success",
          date: dateSQL,
          heure: heureSQL,
          motif,
        });
        dateCursor.setMinutes(dateCursor.getMinutes() + intervalMinutes);
      } catch (err) {
        results.push({ email, status: "failed", error: err.message });
      }
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Programmation des rendez-vous terminée",
      results,
    });
  } catch (error) {
    console.error("❌ Erreur bulk scheduling:", error);
    res.status(500).json({ error: error.message });
  }
};
