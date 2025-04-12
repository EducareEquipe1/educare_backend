/*{
  "development": {
    "username": "process.env.DB_USERNAME",
    "password": "process.env.DB_PASSWORD",
    "database": "process.env.DB_NAME",
    "host": "process.env.DB_HOST",
    "dialect": "mysql"
  },
  "test": {
    "username": "process.env.DB_USERNAME",
    "password": "process.env.DB_PASSWORD",
    "database": "${DB_NAME}_test",
    "host": "process.env.DB_HOST",
    "dialect": "mysql"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "mysql",
    "dialectOptions": {
      "ssl": {
        "ca": "certs/ca.pem",
        "rejectUnauthorized": true
      }
    }
  }
}
*/
require('dotenv').config(); // Load environment variables from .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: `${process.env.DB_NAME}_test`,
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        ca: "certs/ca.pem",
        rejectUnauthorized: true
      }
    }
  }
};
