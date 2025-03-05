"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Patient", {
      // Changed back to singular

      id_patient: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      prenom: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      mot_de_passe: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      sexe: {
        type: Sequelize.ENUM("homme", "femme"),
        allowNull: false,
      },
      date_naissance: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type_patient: {
        type: Sequelize.ENUM("etudiant", "enseignant", "ATS"),
        allowNull: false,
      },
      date_inscription: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Patient");
  },
};
