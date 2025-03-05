const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient"); // Updated path

// Route to add a patient (Create)
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body).catch((err) => {
      console.error("Validation error:", err);
      return res
        .status(400)
        .json({ message: err.errors.map((e) => e.message) });
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all patients (Read)
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update a patient (Update)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    await patient.update(req.body);
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a patient (Delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    await patient.destroy();
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
