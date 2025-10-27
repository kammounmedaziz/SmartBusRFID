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

-- Table for bus trips (Tunisia routes)
CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_city VARCHAR(100) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INT DEFAULT 40,
  bus_type ENUM('standard','express','luxury') DEFAULT 'standard',
  status ENUM('active','cancelled','full') DEFAULT 'active',
  operating_days VARCHAR(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_route (from_city, to_city),
  INDEX idx_departure (departure_time),
  INDEX idx_status (status)
);

-- Table for guest tickets (card payment without login)
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  trip_id INT NOT NULL,
  card_uid VARCHAR(50) NOT NULL,
  passenger_name VARCHAR(100),
  passenger_phone VARCHAR(20),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  travel_date DATE NOT NULL,
  seat_number VARCHAR(10),
  amount_paid DECIMAL(10,2) NOT NULL,
  status ENUM('booked','used','cancelled','expired') DEFAULT 'booked',
  validation_time TIMESTAMP NULL,
  validated_by INT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_card_uid (card_uid),
  INDEX idx_ticket_number (ticket_number),
  INDEX idx_travel_date (travel_date),
  INDEX idx_status (status)
);
