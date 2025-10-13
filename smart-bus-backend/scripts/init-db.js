import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || 'smartbus';

  const sql = `
  CREATE DATABASE IF NOT EXISTS ${dbName};
  USE ${dbName};

  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('admin','operator') DEFAULT 'operator'
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(50) UNIQUE,
    user_id INT,
    balance DECIMAL(10,2) DEFAULT 0,
    status ENUM('active','blocked') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT,
    amount DECIMAL(10,2),
    type ENUM('recharge','payment'),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id)
  );

  INSERT IGNORE INTO cards (uid, balance, status) VALUES
    ('CARD-001', 50.00, 'active'),
    ('CARD-002', 10.00, 'active'),
    ('CARD-003', 0.00, 'active');
  `;

  try {
    await connection.query(sql);
    console.log('✅ Database initialized and sample cards created.');

    // seed admin if env provided
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const [rows] = await connection.query(`SELECT id FROM users WHERE email = ?`, [adminEmail]);
      if (rows.length === 0) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await connection.query(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`, ["Admin", adminEmail, hash]);
        console.log('🔐 Admin user created:', adminEmail);
      } else {
        console.log('🔐 Admin user already exists:', adminEmail);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize DB:', err);
    process.exit(1);
  }
};

run();
