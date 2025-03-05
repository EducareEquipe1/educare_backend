const express = require("express");
const router = express.Router();
const Administrateur = require("../models/Administrateur"); // Updated path

// Route to add an administrateur (Create)
router.post("/", async (req, res) => {
  try {
    const administrateur = await Administrateur.create(req.body);
    res.status(201).json(administrateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all administrateurs (Read)
router.get("/", async (req, res) => {
  try {
    const administrateurs = await Administrateur.findAll();
    res.status(200).json(administrateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update an administrateur (Update)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const administrateur = await Administrateur.findByPk(id);
    if (!administrateur) {
      return res.status(404).json({ message: "Administrateur not found" });
    }
    await administrateur.update(req.body);
    res.status(200).json(administrateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete an administrateur (Delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const administrateur = await Administrateur.findByPk(id);
    if (!administrateur) {
      return res.status(404).json({ message: "Administrateur not found" });
    }
    await administrateur.destroy();
    res.status(200).json({ message: "Administrateur deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
