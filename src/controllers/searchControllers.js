const {
  searchPatientsByName,
  searchUtilisateursByNameOrEmail,
  searchMedicamentsByName,
} = require("../models/searchModel");

exports.searchPatients = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Search term is required." });
  }

  try {
    const patients = await searchPatientsByName(q.trim());
    res.status(200).json({ results: patients });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.searchUsers = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Search term is required." });
  }

  try {
    const patients = await searchUtilisateursByNameOrEmail(q.trim());
    res.status(200).json({ results: patients });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.searchMedicaments = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Search term is required." });
  }
  const upperCaseQuery = q.trim().toUpperCase();
  try {
    const medicaments = await searchMedicamentsByName(upperCaseQuery);
    res.status(200).json({ results: medicaments });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};