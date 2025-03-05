"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Medecin", {
      id_medecin: {
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
      date_naissance: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      specialite: {
        type: Sequelize.STRING(100),
      },
      id_admin: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Administrateur",
          key: "id_admin",
        },
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
    await queryInterface.dropTable("Medecin");
  },
};
