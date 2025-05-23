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
    type: DataTypes.STRING,  
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,  
    allowNull: false,
  },
  num_tel: {
    type: DataTypes.STRING,  
    allowNull: false,
  },
  groupeSanguin: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true,
  },
  numSecuriteSociale: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true,
  },
 
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  situation_famille: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  taille: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  poids: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  tabac_fume: {
    type: DataTypes.BOOLEAN,
    
    allowNull: true,
  },
  tabac_fume_nombre: {
    type: DataTypes.INTEGER,
    
    allowNull: true,
  },
  tabac_chique: {
    type: DataTypes.BOOLEAN,
    
    allowNull: true,
  },
  tabac_chique_nombre: {
    type: DataTypes.INTEGER,
    
    allowNull: true,
  },
  tabac_pris: {
    type: DataTypes.BOOLEAN,
    
    allowNull: true,
  },
  tabac_pris_nombre: {
    type: DataTypes.INTEGER,
   
    allowNull: true,
  },
  age_pris: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ancien_fume: {
    type: DataTypes.BOOLEAN,
  
    allowNull: true,
  },
  periode_exposition: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  alcool: {
    type: DataTypes.BOOLEAN,
    
    allowNull: true,
  },
  medicaments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  affectionsCongenitales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  maladiesGenerales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  interventionsChirurgicales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reactionsAllergiques: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM('directeur', 'ATS', 'enseignant', 'etudiant'),
    allowNull: false,
    
  },
  
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
    references: {
      model: "Utilisateur", 
      key: "id",
    }, }
  
  
 
  
  
  
}, {
  tableName: 'Dossier_Medical',
  timestamps: false,  
});

module.exports = DossierMedical;
