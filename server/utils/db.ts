import mysql from 'mysql2/promise';

// Create a connection pool to the MariaDB database 'pengadaan'
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP/MariaDB password
  database: 'pengadaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to test the connection and initialize tables if needed
export const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MariaDB database: pengadaan');
    
    // Create users table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      )
    `);
    
    connection.release();
  } catch (error) {
    console.error('Error connecting to MariaDB:', error);
    // You might want to handle this more gracefully depending on your app's needs
  }
};
