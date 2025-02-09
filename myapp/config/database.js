// config/database.js
const mysql = require('mysql2');

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',         // Database host (usually localhost)
  user: 'root',              // Your MySQL username
  password: 'admin',         // Your MySQL password
  database: 'userDB'     // Name of your MySQL database
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL...');
});

module.exports = db;  // Export the connection to use in other files
