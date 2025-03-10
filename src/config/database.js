const { Sequelize } = require("sequelize");
const fs = require("fs");

const sequelize = new Sequelize(
  "defaultdb",
  "avnadmin",
  "AVNS_HeIj0FXeoPmepZrO4lA",
  {
    host: "mysql-15ecfd54-esi-b3ed.e.aivencloud.com",
    port: 17785,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync("./certs/ca.pem"), // ✅ Use official SSL certificate
      },
    },
  }
);

module.exports = sequelize;
