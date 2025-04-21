const connection = require("../db").promise(); // update this path if needed

const BlacklistToken = {
  async add(token, expiresAt) {
    const query = `INSERT INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)`;
    await connection.query(query, [token, expiresAt]);
  },

  async isBlacklisted(token) {
    const query = `SELECT * FROM blacklisted_tokens WHERE token = ? AND expires_at > NOW()`;
    const [rows] = await connection.query(query, [token]);
    return rows.length > 0;
  },
};

module.exports = BlacklistToken;
