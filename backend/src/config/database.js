const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'image_gallery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Provide more specific error messages based on error code
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('The database does not exist. Please create it using the SQL script: backend/database.sql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your database username and password in the .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure MySQL server is running');
    }
    
    return false;
  }
}

module.exports = {
  pool,
  testConnection
}; 