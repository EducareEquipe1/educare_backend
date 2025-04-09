const { Sequelize } = require("sequelize");
const fs = require("fs");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "defaultdb",
  process.env.DB_USER || "avnadmin",
  process.env.DB_PASSWORD || "AVNS_HeIj0FXeoPmepZrO4lA",
  {
    host: process.env.DB_HOST || "mysql-15ecfd54-esi-b3ed.e.aivencloud.com",
    port: process.env.DB_PORT || 17785,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync(process.env.DB_SSL_CA_PATH || "./certs/ca.pem"),
      },
    },
  }
);

module.exports = sequelize;
