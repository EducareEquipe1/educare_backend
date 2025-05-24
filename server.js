const express = require("express");
const cors = require("cors");
const patientRoutes = require("./src/routes/patient_routes");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://educare-frontend.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    routes: ["/patients/upload-id-photo"],
  });
});

// Routes
app.use("/patients", patientRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n[APP] Server running on http://localhost:${PORT}`);
  console.log("[APP] Environment:", process.env.NODE_ENV || "development");
});
 
app.use(express.urlencoded({ extended: true }));
