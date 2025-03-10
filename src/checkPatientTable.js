const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "your_host",
  user: "your_user",
  database: "your_database",
  password: "your_password",
});

connection.query("DESCRIBE Patient;", (err, results) => {
  if (err) throw err;
  console.log(results);
  connection.end();
});
