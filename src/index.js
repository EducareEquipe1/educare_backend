const express = require("express");
const app = express();
const sequelize = require("./config/database");
require("dotenv").config();
const db = require("./db");

// Import routes

const patientRoutes = require("./routes/patient_routes");
const medecinRoutes = require("./routes/medecin_routes");
const administrateurRoutes = require("./routes/administrateur_routes");

app.use(express.json());


// Use routes

app.use("/patients", patientRoutes);
app.use("/medecins", medecinRoutes);
app.use("/administrateurs", administrateurRoutes);

app.get("/", (req, res) => {
  db.query("SELECT NOW()", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Database error");
    } else {
      res.send(`Database connected! Server time: ${results[0]["NOW()"]}`);
    }
  });
});

// Test database connection

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
