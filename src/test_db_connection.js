const { Sequelize } = require("sequelize");

// Create a new instance of Sequelize
const sequelize = new Sequelize("gestion_medicale", "root", "12 Soleil 2004", {
  host: "127.0.0.1",
  dialect: "mysql",
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
