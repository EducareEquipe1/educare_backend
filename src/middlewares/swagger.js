const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Patient API",
      version: "1.0.0",
      description: "API for patient authentication and account management",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/patient_routes.js"],

};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at: http://localhost:3000/api-docs");
};

module.exports = swaggerDocs;
