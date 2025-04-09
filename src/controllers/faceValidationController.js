const asyncHandler = require("../middlewares/asyncHandler");
const { cloudinary } = require("../config/cloudinary");
const multer = require("multer");
const connection = require("../db");
const streamifier = require("streamifier");

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
}).single("image");

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
    // Debug logging
    console.log("[DEBUG] Request body:", req.body);

    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Get patientId, handling potential space in key name
    const patientId = req.body.patientId || req.body["patientId "];

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
        debug: { body: req.body },
      });
    }

    // Clean patientId value (remove any whitespace)
    const cleanPatientId = patientId.toString().trim();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "educare/patient_photos",
          resource_type: "image",
          transformation: [
            { quality: "auto:best" },
            { width: 800, crop: "limit" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Update database with cleaned patientId
    const imageUrl = result.secure_url;
    console.log("[DEBUG] Attempting to update Patient record:", {
      patientId: cleanPatientId,
      imageUrl,
    });
    await new Promise((resolve, reject) => {
      const updateQuery = `UPDATE defaultdb.Patient SET photo = ? WHERE id = ?`;
      console.log("[DEBUG] Executing query:", updateQuery);
      connection.query(
        updateQuery,
        [imageUrl, cleanPatientId],
        (err, result) => {
          if (err) {
            console.error("[DATABASE ERROR]", {
              error: err,
              query: updateQuery,
              parameters: [imageUrl, cleanPatientId],
              connection: connection.config,
            });
            reject(err);
          } else {
            console.log("[DEBUG] Update successful:", result);
            resolve(result);
          }
        }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        patientId: cleanPatientId,
      },
    });
  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Error processing image upload",
      error: error.message,
    });
  }
};

const getPatientPhoto = asyncHandler(async (req, res) => {
  try {
    const patientId = req.params.id;
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const cleanPatientId = patientId.toString().trim();

    const [rows] = await connection
      .promise()
      .query(`SELECT photo FROM defaultdb.Patient WHERE id = ?`, [
        cleanPatientId,
      ]);

    if (!rows.length || !rows[0].photo) {
      return res.status(404).json({
        success: false,
        message: "No photo found for this patient",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        photoUrl: rows[0].photo,
        patientId: cleanPatientId,
      },
    });
  } catch (error) {
    console.error("[GET PHOTO ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving patient photo",
      error: error.message,
    });
  }
});

module.exports = {
  uploadMiddleware,
  uploadImage,
  getPatientPhoto,
};
