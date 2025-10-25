CREATE DATABASE IF NOT EXISTS smartbus;
USE smartbus;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('admin','operator','user','controller') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(50) UNIQUE,
  user_id INT,
  balance DECIMAL(10,2) DEFAULT 0,
  status ENUM('active','blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('recharge','payment','manual_payment') DEFAULT 'payment',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description VARCHAR(255),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_timestamp (timestamp)
);

-- Table for ticket validations by controllers
CREATE TABLE ticket_validations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  controller_id INT NOT NULL,
  validation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(100),
  status ENUM('success','failed') DEFAULT 'success',
  fare_amount DECIMAL(10,2),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (controller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_controller_id (controller_id),
  INDEX idx_validation_time (validation_time)
);

-- Table for manual payments when card fails
CREATE TABLE manual_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','card','mobile') DEFAULT 'cash',
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Table for controller activity logs
CREATE TABLE controller_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  controller_id INT NOT NULL,
  action_type ENUM('login','logout','validation','break_start','break_end') NOT NULL,
  action_details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (controller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_controller_id (controller_id),
  INDEX idx_timestamp (timestamp)
);
