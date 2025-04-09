const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Validate configuration
const required = ["cloud_name", "api_key", "api_secret"];
const missing = required.filter((key) => !config[key]);
if (missing.length) {
  throw new Error(`Missing Cloudinary configuration: ${missing.join(", ")}`);
}

// Configure Cloudinary
cloudinary.config({
  ...config,
  secure: true,
});

// Storage configuration
const medicalIdStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "educare/medical_ids",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto:best" },
    ],
    public_id: (req, file) => `med_id_${Date.now()}`,
    resource_type: "image",
    invalidate: true,
  },
});

// Test connection
cloudinary.api
  .ping()
  .then(() => console.log("[CLOUDINARY] Connection successful"))
  .catch((err) => console.error("[CLOUDINARY] Connection failed:", err));

module.exports = {
  cloudinary,
  medicalIdStorage,
};
