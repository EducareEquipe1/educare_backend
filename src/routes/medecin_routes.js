const express = require("express");
const router = express.Router();
const Medecin = require("../models/Medecin"); // Updated path

// Route to add a medecin (Create)
router.post("/", async (req, res) => {
  try {
    const medecin = await Medecin.create(req.body);
    res.status(201).json(medecin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all medecins (Read)
router.get("/", async (req, res) => {
  try {
    const medecins = await Medecin.findAll();
    res.status(200).json(medecins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update a medecin (Update)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const medecin = await Medecin.findByPk(id);
    if (!medecin) {
      return res.status(404).json({ message: "Medecin not found" });
    }
    await medecin.update(req.body);
    res.status(200).json(medecin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a medecin (Delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const medecin = await Medecin.findByPk(id);
    if (!medecin) {
      return res.status(404).json({ message: "Medecin not found" });
    }
    await medecin.destroy();
    res.status(200).json({ message: "Medecin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
