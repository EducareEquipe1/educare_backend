const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Patient = sequelize.define("Patient", {
  // Corrected syntax with comma
  id_patient: {
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
    validate: {
      isEmail: {
        msg: "Email must be a valid email address.",
      },
      endsWithEsi: function (value) {
        if (!value.endsWith("@esi-sba.dz")) {
          throw new Error("Email must end with '@esi-sba.dz'");
        }
      },
    },
  },

  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  sexe: {
    type: DataTypes.ENUM("homme", "femme"),
    allowNull: false,
  },
  date_naissance: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type_patient: {
    type: DataTypes.ENUM("etudiant", "enseignant", "ATS"),
    allowNull: false,
  },
  date_inscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Patient;
