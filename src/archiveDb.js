const mysql = require("mysql2");

// Load database configuration
const config = require("./config/config")[
  process.env.NODE_ENV || "development"
];

// Create MySQL connection
const connectionArchive = mysql.createConnection({
  // Added error handling for connection issues

  host: process.env.DB_HOST || "mysql-15ecfd54-esi-b3ed.e.aivencloud.com",
  port: process.env.DB_PORT || 17785,
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_HeIj0FXeoPmepZrO4lA",
  database: process.env.DB_NAME || "archive",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Connect to MySQL
connectionArchive.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL archive:", err);
    return;
  }

  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ Connected to Aiven MySQL archive database.");
});

module.exports = connectionArchive;
