const express = require("express");
const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.json({ message: "medcin route works!" });
});

module.exports = router; // ✅ Make sure you're exporting the router correctly
