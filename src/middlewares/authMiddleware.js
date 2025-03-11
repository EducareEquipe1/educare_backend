const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");


const JWT_SECRET = "*;':$S*O%k<gKB7'[6Heh4|J@nb{/!";

// Middleware to verify JWT token using async handler
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    const decoded = await jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded; // Store user info in request object

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware to check user roles using async handler
exports.authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied. Unauthorized role." });
      }
      next();
    } catch (err) {
      return res.status(500).json({ message: "Authorization error." });
    }
  };
};
