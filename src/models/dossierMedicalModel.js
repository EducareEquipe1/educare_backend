const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
 
const connection = require("../db"); // Import the database connection
const bcrypt = require("bcrypt");




const DossierMedical = sequelize.define("Dossier_Medical", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_naissance: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,  // Ensure nom is defined here
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,  // Ensure prenom is defined here
    allowNull: false,
  },
  num_tel: {
    type: DataTypes.STRING,  // Ensure num_tel is defined here
    allowNull: false,
  },
  groupeSanguin: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  numSecuriteSociale: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
 
  adresse: {
    type: DataTypes.STRING(255),
  },
  situation_famille: {
    type: DataTypes.STRING(100),
  },
  
  taille: {
    type: DataTypes.FLOAT,
  },
  poids: {
    type: DataTypes.FLOAT,
  },
  tabac_fume: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tabac_fume_nombre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tabac_chique: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tabac_chique_nombre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tabac_pris: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tabac_pris_nombre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  age_pris: {
    type: DataTypes.INTEGER,
  },
  ancien_fume: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  periode_exposition: {
    type: DataTypes.INTEGER,
  },
  alcool: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  medicaments: {
    type: DataTypes.TEXT,
  },
  affectionsCongenitales: {
    type: DataTypes.TEXT,
  },
  maladiesGenerales: {
    type: DataTypes.TEXT,
  },
  interventionsChirurgicales: {
    type: DataTypes.TEXT,
  },
  reactionsAllergiques: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  statut: {
    type: DataTypes.ENUM('directeur', 'ATS', 'enseignant', 'etudiant'),
    allowNull: false,
  },
  
    
  email: {
    type: DataTypes.STRING(255),
    references: {
      model: 'Utilisateur',  
      key: 'email',
    },
    onDelete: 'CASCADE',
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Utilisateur',  
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  
  
}, {
  tableName: 'Dossier_Medical',
  timestamps: false,  
});

module.exports = DossierMedical;
