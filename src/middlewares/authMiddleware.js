const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const connection = require("../db"); // Import the database connection



const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// Middleware to verify JWT token using async handler
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access Denied" });

  const token = authHeader.split(" ")[1]; // Extract only the actual token

  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Store user data in request
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid or Expired Token" });
  }
};


// Middleware to check user roles using async handler
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.email !== "ni.merzouk@esi-sba.dz") {
    return res.status(403).json({ message: "Access Denied: Admins Only" });
  }
  next();
};

// Middleware to check if user is a doctor
const doctorMiddleware = asyncHandler(async (req, res, next) => {
  const userId = req.user.id; // Extracted from token via authMiddleware

  connection.query(
    "SELECT * FROM Medecin WHERE utilisateur_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("DB error in doctorMiddleware:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(403).json({ message: "Access Denied: Doctors Only" });
      }

      next(); // User is a doctor
    }
  );
});


module.exports = { authMiddleware, adminMiddleware, doctorMiddleware };