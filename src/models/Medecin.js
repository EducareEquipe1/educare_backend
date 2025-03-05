const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Medecin = sequelize.define("Medecin", {
  id_medecin: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  date_naissance: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  specialite: {
    type: DataTypes.STRING(100),
  },
  id_admin: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Medecin;
