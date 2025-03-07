const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password, first_name, last_name, phone, birth_date, role_id } =
    req.body;

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM Utilisateur WHERE email = ?",
      [email]
    );
    if (existingUser.length)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO Utilisateur (email, password, first_name, last_name, phone, birth_date) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, first_name, last_name, phone, birth_date]
    );

    await db.query(
      "INSERT INTO Utilisateur_Role (utilisateur_id, role_id) VALUES (?, ?)",
      [result.insertId, role_id]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      "SELECT * FROM Utilisateur WHERE email = ?",
      [email]
    );
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const [roles] = await db.query(
      "SELECT r.designation FROM Role r INNER JOIN Utilisateur_Role ur ON r.id_role = ur.role_id WHERE ur.utilisateur_id = ?",
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, roles: roles.map((r) => r.designation) },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
