const connection = require("../db"); // Adjusted path to the database connection

const createTables = [
  `
CREATE TABLE IF NOT EXISTS Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    last_name VARCHAR(100),
    first_name VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    birth_date DATE,
    phone VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS Role (
    id_role INT PRIMARY KEY AUTO_INCREMENT,
    designation VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permission (
    id_permission INT PRIMARY KEY AUTO_INCREMENT,
    designation VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Utilisateur_Role (
    utilisateur_id INT,
    role_id INT,
    PRIMARY KEY (utilisateur_id, role_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Role(id_role) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Role_Permission (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES Role(id_role) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(id_permission) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Patient (
    id INT PRIMARY KEY,
    matricule INT UNIQUE NOT NULL,
    categorie VARCHAR(50),
    social_security_number INT UNIQUE,
    blood_type CHAR(3),
    gender CHAR(10),
    FOREIGN KEY (id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Medcin (
    id INT PRIMARY KEY,
    matricule INT UNIQUE NOT NULL,
    speciality VARCHAR(255) NOT NULL,
    FOREIGN KEY (id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Admin (
    id INT PRIMARY KEY,
    matricule INT UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS AssistantMedical (
    id INT PRIMARY KEY,
    matricule INT UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Backup (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backupFrequency INT,
    backupLocation VARCHAR(255),
    lastBackupDate DATE
);

CREATE TABLE IF NOT EXISTS AppParams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    logo BLOB,
    establishmentName VARCHAR(255),
    tauxTVA INT
);
`
];

// Execute queries one by one
createTables.forEach((query, index) => {
  connection.query(query, (err) => {
    if (err) {
      console.error(`❌ Error creating table #${index + 1}:`, err);
    } else {
      console.log(`✅ Table #${index + 1} created successfully.`);
    }
  });
});

// Close connection after execution
connection.end((err) => {
  if (err) {
    console.error("❌ Error closing connection:", err);
  } else {
    console.log("✅ Database setup complete.");
  }
});
