const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./db");
const setupSwagger = require("./middlewares/swagger");
const cors = require("cors");

// Import routes

const patientRoutes = require("./routes/patient_routes");
const medecinRoutes = require("./routes/medecin_routes");
const administrateurRoutes = require("./routes/administrateur_routes");
const directeurRoutes = require("./routes/directeur_routes");
//const dossierMedicalRoutes = require("./routes/dossierMedical_routes");

app.use(
  cors({
    origin: "*", // Change this to your frontend URL for better security
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());
// Use routes

app.use("/patients", patientRoutes);
app.use("/medecins", medecinRoutes);
app.use("/admin", administrateurRoutes);
app.use("/directeur", directeurRoutes);

setupSwagger(app);

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

//app.use("/api/dossier-medical", dossierMedicalRoutes);
// Test database connection

const PORT = process.env.PORT || 3000; // Use Render's assigned port or default to 3000 locally

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
