const asyncHandler = require("../middlewares/asyncHandler");
const { cloudinary } = require("../config/cloudinary");
const multer = require("multer");
const connection = require("../db");
const streamifier = require("streamifier");
const path = require("path");
const fs = require("fs");

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"), false);
      return;
    }
    cb(null, true);
  },
}).any(); // <-- change from .single('image') to .any()

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: "File upload error",
        error: err.message,
      });
    }
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Server error during upload",
        error: err.message,
      });
    }
    next();
  });
};

const uploadImage = async (req, res) => {
  try {
    const email = req.body.email;
    const file = req.file || (req.files && req.files[0]);
    console.log("Email:", email);
    console.log("File:", file);
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "educare/patients",
            public_id: email.replace(/[@.]/g, "_"),
            overwrite: true,
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(file.buffer);

    // Save the image URL to the user's profile in your DB (use 'photo' column)
    connection.query(
      `UPDATE Patient 
       JOIN Utilisateur ON Patient.Utilisateur_id = Utilisateur.id 
       SET Patient.photo = ? 
       WHERE Utilisateur.email = ?`,
      [result.secure_url, email],
      (err, dbRes) => {
        if (err) {
          return res.status(500).json({
            error: "Failed to update profile image",
            details: err.message,
          });
        }
        if (dbRes.affectedRows === 0) {
          return res
            .status(404)
            .json({ error: "No patient found with this email" });
        }
        res
          .status(200)
          .json({ message: "Image uploaded", imageUrl: result.secure_url });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
};

const getPatientPhoto = async (req, res) => {
  try {
    const email = req.params.email.trim();

    connection.query(
      `SELECT Patient.photo 
       FROM Patient 
       JOIN Utilisateur ON Patient.Utilisateur_id = Utilisateur.id 
       WHERE Utilisateur.email = ?`,
      [email],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Could not fetch image",
            details: err.message,
          });
        }
        if (!results || results.length === 0) {
          return res.status(404).json({
            success: false,
            image: null,
            message: "No patient found with this email",
          });
        }
        if (!results[0].photo) {
          return res.status(200).json({
            success: false,
            image: null,
            message: "No photo found for this patient",
          });
        }
        // Photo exists, return it!
        return res.status(200).json({ success: true, image: results[0].photo });
      }
    );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Could not fetch image",
      details: err.message,
    });
  }
};

module.exports = {
  uploadMiddleware,
  uploadImage,
  getPatientPhoto,
};
