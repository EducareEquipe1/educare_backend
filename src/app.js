const express = require("express");
const app = express();
const sequelize = require("./config/database");

// Import routes
const patientRoutes = require("./patient_routes");
const medecinRoutes = require("./medecin_routes");
const administrateurRoutes = require("./administrateur_routes");

app.use(express.json());

// Use routes
app.use("/patients", patientRoutes);
app.use("/medecins", medecinRoutes);
app.use("/administrateurs", administrateurRoutes);

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
