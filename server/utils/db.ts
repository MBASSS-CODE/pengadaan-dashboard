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

    // Create ppk_master table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ppk_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nip_nama_masked VARCHAR(255) UNIQUE NOT NULL,
        nama_lengkap VARCHAR(255),
        nip_asli VARCHAR(255),
        jabatan VARCHAR(255),
        unit_kerja VARCHAR(255),
        telepon VARCHAR(50),
        email VARCHAR(255),
        created_at DATETIME,
        updated_at DATETIME
      )
    `);

    // Create penyedia_master table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS penyedia_master (
        kode_penyedia VARCHAR(255) PRIMARY KEY,
        nama_penyedia VARCHAR(255),
        npwp VARCHAR(50),
        alamat TEXT,
        telepon VARCHAR(50),
        email VARCHAR(255),
        jenis_perusahaan VARCHAR(100),
        bentuk_usaha VARCHAR(100),
        status_umkk INT,
        status_aktif VARCHAR(50),
        nib VARCHAR(50),
        status_api ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
        retry_count INT DEFAULT 0,
        created_at DATETIME,
        updated_at DATETIME
      )
    `);

    // Add columns dynamically if they don't exist (for existing tables)
    const newColumns = [
      'telepon VARCHAR(50)', 'email VARCHAR(255)', 'jenis_perusahaan VARCHAR(100)',
      'bentuk_usaha VARCHAR(100)', 'status_umkk INT', 'status_aktif VARCHAR(50)', 'nib VARCHAR(50)'
    ];
    for (const col of newColumns) {
      try {
        await connection.query(`ALTER TABLE penyedia_master ADD COLUMN ${col}`);
      } catch (e) {
        // Ignore column already exists errors
      }
    }
    
    connection.release();
  } catch (error) {
    console.error('Error connecting to MariaDB:', error);
    // You might want to handle this more gracefully depending on your app's needs
  }
};
