const express = require("express");
const cors = require("cors");
const patientRoutes = require("./src/routes/patient_routes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Add health check endpoint
app.get("/api/health", (req, res) => {
  console.log("Health check endpoint hit");
  res.json({ status: "ok", routes: ["/api/patients/upload-id-photo"] });
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`\n[APP] Incoming ${req.method} request to ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  next();
});

app.use("/api/patients", patientRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n[APP] Server running on http://localhost:${PORT}`);
  console.log("[APP] Registered routes:");
  console.log("- POST /api/patients/upload-id-photo");
});
