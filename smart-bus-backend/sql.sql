CREATE DATABASE IF NOT EXISTS smartbus;
USE smartbus;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('admin','operator') DEFAULT 'operator'
);

CREATE TABLE cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(50) UNIQUE,
  user_id INT,
  balance DECIMAL(10,2) DEFAULT 0,
  status ENUM('active','blocked') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT,
  amount DECIMAL(10,2),
  type ENUM('recharge','payment'),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id)
);
