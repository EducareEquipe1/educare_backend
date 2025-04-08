const asyncHandler = require("../middlewares/asyncHandler");
const { cloudinary } = require("../config/cloudinary");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "patient_ids",
    });

    res.status(200).json({
      success: true,
      data: {
        imageUrl: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image",
    });
  }
});

const uploadMiddleware = (req, res, next) => {
  console.log("Upload middleware processing request...");
  upload(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
      });
    }
    console.log("Upload middleware successful, file:", req.file);
    next();
  });
};

module.exports = { uploadMiddleware, uploadImage };
