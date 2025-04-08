const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Direct configuration values (REPLACE THESE WITH YOUR ACTUAL VALUES)
const config = {
  cloud_name: "dhefudthm",
  api_key: "857441834646328",
  api_secret: "nS5K4h5xaSlP5n5XHLKmtPAorbo",
};

// Verify all required values are present
const required = ["cloud_name", "api_key", "api_secret"];
const missing = required.filter((key) => !config[key]);
if (missing.length) {
  throw new Error(`Missing Cloudinary config: ${missing.join(", ")}`);
}

// Configure Cloudinary
cloudinary.config({
  ...config,
  secure: true, // Always use HTTPS
});

// Medical ID photo storage with strict validation
const medicalIdStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "educare/medical_ids",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
      { quality: "auto:best" },
    ],
    public_id: (req, file) => {
      const userId = req.user?.id || "temp";
      return `med_id_${userId}_${Date.now()}`;
    },
    resource_type: "image",
    invalidate: true, // Refresh CDN cache
  },
});

// Test connection
cloudinary.api
  .ping()
  .then(() => console.log("Cloudinary connection successful"))
  .catch((err) => console.error("Cloudinary connection failed:", err));

module.exports = {
  cloudinary,
  medicalIdStorage,
};
