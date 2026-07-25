import mysql from 'mysql2/promise';

const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = isProduction ? {
  host: process.env.DB_HOST_PROD || 'localhost',
  user: process.env.DB_USER_PROD || 'root',
  password: process.env.DB_PASSWORD_PROD || '',
  database: process.env.DB_NAME_PROD || 'pengadaan_prod',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
} : {
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP/MariaDB password
  database: 'pengadaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool to the database based on environment
export const pool = mysql.createPool(dbConfig);

// Helper function to test the connection and initialize tables if needed
export const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`Successfully connected to MariaDB database: ${dbConfig.database} (Environment: ${isProduction ? 'Production' : 'Development'})`);
    
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
