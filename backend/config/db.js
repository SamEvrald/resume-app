// backend/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');
// Load .env from backend root. Adjust path if your .env is elsewhere relative to this file.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection when the module is loaded
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database.');
    connection.release(); // Release the connection immediately after testing
  })
  .catch(err => {
    console.error('Failed to connect to MySQL database:', err);
    // It's critical for the backend to have a DB connection, so exit if it fails
    process.exit(1);
  });

module.exports = pool;
