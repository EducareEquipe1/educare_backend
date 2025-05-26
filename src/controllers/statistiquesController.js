const { patient } = require("../models/authPatientModel");

const connection = require("../db");
const db = connection.promise();
const {
  getMaladiesForPatientm,
  hasMaladieForPatientm,
} = require("../models/statistiquesModel");

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

module.exports = {
  countPatients,
  getAnneeUniversitaire,
  countConsultations,
  countMaladiesContagieuses,
  getMaladiesForPatient,
  hasMaladieForPatient,
};
