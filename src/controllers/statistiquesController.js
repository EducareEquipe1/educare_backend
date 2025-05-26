const { patient } = require("../models/authPatientModel");
const { QueryTypes } = require("sequelize");
const connection = require("../db");
const db = connection.promise();
const sequelize = require("../config/database");
const {
  getMaladiesForPatientm,
  hasMaladieForPatientm,getConsultationsParMoisByYear,lierMaladieAuPatient,
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
    const selectedYear = parseInt(req.params.year); // ou req.query.year si tu préfères en query string

    if (isNaN(selectedYear)) {
      return res.status(400).json({ error: "Année invalide." });
    }

    const startDate = `${selectedYear - 1}-09-01`;
    const endDate = `${selectedYear}-05-31`;

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
        WHERE c.date BETWEEN :startDate AND :endDate
        GROUP BY MONTH(c.date), MONTHNAME(c.date), YEAR(c.date)
      ),
      jour_pointe AS (
        SELECT 
          MONTH(c.date) AS mois_num,
          YEAR(c.date) AS annee,
          DAYNAME(c.date) AS jour,
          COUNT(*) AS nb
        FROM Consultation c
        WHERE c.date BETWEEN :startDate AND :endDate
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
      {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    await sequelize.query("SET SESSION sql_mode=(SELECT CONCAT(@@sql_mode,',ONLY_FULL_GROUP_BY'))");

    res.status(200).json(statistiques);
  } catch (error) {
    console.error("Erreur SQL:", {
      message: error.message,
      sql: error.sql,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Erreur lors du traitement des statistiques",
      detail: error.message,
    });
  }
};

const getConsultationsParMois = async (req, res) => {
  const year = parseInt(req.params.annee);
  try {
    const data = await statistiquesModel.getConsultationsParMoisByYear(year);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.toString() });
  }
};

const getConsultationsParCategorieAnnuelle = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year || isNaN(year)) {
      return res.status(400).json({ error: "⚠️ Année invalide" });
    }

    const startDate = `${year - 1}-09-01`;
    const endDate = `${year}-05-31`;

    const results = await sequelize.query(
      `
      SELECT 
        p.categorie AS name, 
        COUNT(*) AS value
      FROM Consultation c
      JOIN Patient p ON c.patient_id = p.id
      WHERE c.date BETWEEN :startDate AND :endDate
      GROUP BY p.categorie
      `,
      {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT
      }
    );

    // S'assurer que chaque catégorie est bien présente
    const categories = ["Etudiant", "Enseignant", "ATS"];
    const formatted = categories.map(cat => {
      const found = results.find(r => r.name === cat);
      return { name: cat, value: found ? found.value : 0 };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Erreur stats annuelles par catégorie:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


const getMedicamentsPlusPrescrits = async (req, res) => {
  try {
    const results = await sequelize.query(
      `
      SELECT 
        m.nom_de_marque AS name,
        COUNT(mio.medicament_id) AS value
      FROM MedicamentsInOrdonnance mio
      JOIN medicaments m ON mio.medicament_id = m.id
      GROUP BY m.nom_de_marque
      ORDER BY value DESC
      LIMIT 10
      `,
      {
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des médicaments les plus prescrits :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};



const getRepartitionPatientsParCategorie = async (req, res) => {
  try {
    const results = await sequelize.query(
      `
      SELECT 
        categorie,
        COUNT(*) AS nombre
      FROM Patient
      GROUP BY categorie
      `,
      {
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération de la répartition des patients :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};



const ajouterMaladieAuPatient = async (req, res) => {
  try {
    const { email, id_maladie, date_diagnostic } = req.body;

    const result = await lierMaladieAuPatient(email, id_maladie, date_diagnostic);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la maladie au patient :", error.message);
    res.status(500).json({ error: error.message });
  }
};



const getMaladiesParMois = async (req, res) => {
  try {
    const { type, annee } = req.params;

    if (!["contagieuse", "cronique"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Type de maladie invalide (contagieuse ou cronique)." });
    }

    const anneeNum = parseInt(annee);
    if (isNaN(anneeNum)) {
      return res.status(400).json({ message: "Année invalide." });
    }

    const startDate = `${anneeNum - 1}-09-01`;
    const endDate = `${anneeNum}-05-31`;

    const result = await sequelize.query(
      `
      SELECT MONTH(pm.date_diagnostic) AS mois, COUNT(*) AS total
      FROM Patient_Maladie pm
      JOIN Maladie m ON pm.id_maladie = m.id
      WHERE m.type = ? AND pm.date_diagnostic BETWEEN ? AND ?
      GROUP BY MONTH(pm.date_diagnostic)
      `,
      {
        replacements: [type.toLowerCase(), startDate, endDate],
        type: QueryTypes.SELECT
      }
    );

    const moisFr = [
      "janvier", "février", "mars", "avril", "mai",
      "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ];

    const moisSelectionnes = [9, 10, 11, 12, 1, 2, 3, 4, 5];

    const formatted = moisSelectionnes.map(mois => {
      const found = result.find(r => r.mois === mois);
      return {
        name: moisFr[mois - 1],
        value: found ? found.total : 0
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur", detail: error.message });
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
  getConsultationsParCategorieAnnuelle,
  getMedicamentsPlusPrescrits,
  getRepartitionPatientsParCategorie,
  ajouterMaladieAuPatient,getMaladiesParMois,
};
