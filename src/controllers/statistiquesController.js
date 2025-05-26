const { patient } = require("../models/authPatientModel");
const { QueryTypes } = require("sequelize");
const connection = require("../db");
const db = connection.promise();
const sequelize = require("../config/database");
const {
  getMaladiesForPatientm,
  hasMaladieForPatientm,getConsultationsParMoisByYear,
} = require("../models/statistiquesModel");
const statistiquesModel = require("../models/statistiquesModel");

const countPatients = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM Patient");
    res.status(200).json({ total: rows[0].total });
  } catch (error) {
    console.error("Erreur SQL lors du comptage des patients :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors du comptage des patients" });
  }
};

const getAnneeUniversitaire = (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const anneeUniversitaire =
    month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

  res.status(200).json({ anneeUniversitaire });
};

const countConsultations = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM Consultation");
    const totalConsultations = rows[0].total;
    res.status(200).json({ total: totalConsultations });
  } catch (error) {
    console.error("Erreur lors du comptage des consultations :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors du comptage des consultations" });
  }
};

const countMaladiesContagieuses = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM Patient_Maladie pm
      JOIN Maladie m ON pm.id_maladie = m.id
      WHERE m.type = 'contagieuse'
    `);

    res.status(200).json({ total: rows[0].total });
  } catch (error) {
    console.error("Erreur lors du comptage des maladies contagieuses :", error);
    res.status(500).json({ message: "Erreur serveur lors du comptage" });
  }
};

const hasMaladieForPatient = async (req, res) => {
  const { id_patient } = req.params;
  console.log("➡️ Checking if maladies exist for patient");

  try {
    const result = await hasMaladieForPatient(id_patient);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Server error: " + error,
    });
  }
};
const getMaladiesForPatient = async (req, res) => {
  const { id_patient } = req.params;
  console.log("➡️ Fetching maladies for patient");

  try {
    const maladies = await getMaladiesForPatient(id_patient);

    if (!maladies || maladies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "⚠️ No maladies found for this patient.",
      });
    }

    return res.status(200).json({
      success: true,
      data: maladies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Server error: " + error,
    });
  }
};


const getConsultationStats = async (req, res) => {
  try {
    await sequelize.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");

    const statistiques = await sequelize.query(
      `
      WITH consultation_par_mois AS (
        SELECT 
          MONTHNAME(c.date) AS mois,
          MONTH(c.date) AS mois_num,
          YEAR(c.date) AS annee,
          COUNT(*) AS total,
          SUM(p.categorie = 'Etudiant') AS etudiants,
          SUM(p.categorie = 'Enseignant') AS enseignants,
          SUM(p.categorie = 'ATS') AS ats
        FROM Consultation c
        JOIN Patient p ON c.patient_id = p.id
        WHERE (MONTH(c.date) BETWEEN 9 AND 12 OR MONTH(c.date) BETWEEN 1 AND 5)
        GROUP BY MONTH(c.date), MONTHNAME(c.date), YEAR(c.date)
      ),
      jour_pointe AS (
        SELECT 
          MONTH(c.date) AS mois_num,
          YEAR(c.date) AS annee,
          DAYNAME(c.date) AS jour,
          COUNT(*) AS nb
        FROM Consultation c
        WHERE (MONTH(c.date) BETWEEN 9 AND 12 OR MONTH(c.date) BETWEEN 1 AND 5)
        GROUP BY YEAR(c.date), MONTH(c.date), DAYNAME(c.date)
      ),
      jour_max AS (
        SELECT jp.annee, jp.mois_num, jp.jour
        FROM jour_pointe jp
        JOIN (
          SELECT annee, mois_num, MAX(nb) AS max_nb
          FROM jour_pointe
          GROUP BY annee, mois_num
        ) max_jp
        ON jp.annee = max_jp.annee AND jp.mois_num = max_jp.mois_num AND jp.nb = max_jp.max_nb
      )
      SELECT cpm.*, jm.jour AS jourDePointe
      FROM consultation_par_mois cpm
      LEFT JOIN jour_max jm ON cpm.annee = jm.annee AND cpm.mois_num = jm.mois_num
      ORDER BY cpm.annee, cpm.mois_num
      `,
      { type: QueryTypes.SELECT }
    );

    await sequelize.query("SET SESSION sql_mode=(SELECT CONCAT(@@sql_mode,',ONLY_FULL_GROUP_BY'))");

    res.status(200).json(statistiques);
  } catch (error) {
    console.error("Complete error details:", {
      message: error.message,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Erreur lors du traitement des statistiques",
      detail: error.message
    });
  }
};

const moisFr = [
  "janvier", "fevrier", "mars", "avril", "mai", "juin",
  "juillet", "aout", "septembre", "octobre", "novembre", "decembre"
];
const getConsultationsParMois = async (req, res) => {
  const year = parseInt(req.params.annee);
  try {
    const data = await statistiquesModel.getConsultationsParMoisByYear(year);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.toString() });
  }
};


module.exports = {
  countPatients,
  getAnneeUniversitaire,
  countConsultations,
  countMaladiesContagieuses,
  getMaladiesForPatient,
  hasMaladieForPatient,
  getConsultationStats,
  getConsultationsParMois,
};
