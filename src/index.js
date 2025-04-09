const express = require("express");
const app = express();
const sequelize = require("./config/database");
require("dotenv").config();
const db = require("./db");
const setupSwagger = require("./middlewares/swagger");
const cors = require("cors");
const { cloudinary } = require("./config/cloudinary");

// Import routes
const patientRoutes = require("./routes/patient_routes");
const medecinRoutes = require("./routes/medecin_routes");
const administrateurRoutes = require("./routes/administrateur_routes");
const directeurRoutes = require("./routes/directeur_routes");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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

app.get("/api/cloudinary-health", (req, res) => {
  cloudinary.api
    .ping()
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Cloudinary connection is successful",
      });
    })
    .catch((err) => {
      console.error("[CLOUDINARY HEALTH ERROR]", err);
      res.status(500).json({
        success: false,
        message: "Cloudinary connection failed",
        error: err.message,
      });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
