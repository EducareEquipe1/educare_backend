const { Sequelize } = require("sequelize"); // Import Sequelize

// Create a new instance of Sequelize
const sequelize = new Sequelize("gestion_medicale", "root", "12 Soleil 2004", {
  host: "localhost",
  dialect: "mysql",
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize; // Export the Sequelize instance
