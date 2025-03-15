const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");


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

module.exports = { authMiddleware, adminMiddleware };