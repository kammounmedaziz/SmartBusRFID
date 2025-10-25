import pool from './config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to database');

    // Check if database exists
    const [databases] = await connection.query("SHOW DATABASES LIKE 'smartbus'");
    
    if (databases.length === 0) {
      console.log('📦 Database does not exist. Creating new database...');
      const sqlContent = fs.readFileSync(join(__dirname, 'sql.sql'), 'utf8');
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('✅ Database created successfully!');
      return;
    }

    console.log('📊 Database exists. Checking for required migrations...');
    await connection.query('USE smartbus');

    // Migration 1: Check and update users table for controller role
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM users WHERE Field = 'role'"
    );
    
    if (columns.length > 0) {
      const roleColumn = columns[0];
      if (!roleColumn.Type.includes('controller')) {
        console.log('🔄 Adding controller role to users table...');
        await connection.query(
          "ALTER TABLE users MODIFY role ENUM('admin','operator','user','controller') DEFAULT 'user'"
        );
        console.log('✅ Controller role added to users table');
      } else {
        console.log('✓ Controller role already exists in users table');
      }
    }

    // Migration 2: Check and create ticket_validations table
    const [ticketValidations] = await connection.query(
      "SHOW TABLES LIKE 'ticket_validations'"
    );
    
    if (ticketValidations.length === 0) {
      console.log('🔄 Creating ticket_validations table...');
      await connection.query(`
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
        )
      `);
      console.log('✅ ticket_validations table created');
    } else {
      console.log('✓ ticket_validations table already exists');
    }

    // Migration 3: Check and create manual_payments table
    const [manualPayments] = await connection.query(
      "SHOW TABLES LIKE 'manual_payments'"
    );
    
    if (manualPayments.length === 0) {
      console.log('🔄 Creating manual_payments table...');
      await connection.query(`
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
        )
      `);
      console.log('✅ manual_payments table created');
    } else {
      console.log('✓ manual_payments table already exists');
    }

    // Migration 4: Check and create controller_logs table
    const [controllerLogs] = await connection.query(
      "SHOW TABLES LIKE 'controller_logs'"
    );
    
    if (controllerLogs.length === 0) {
      console.log('🔄 Creating controller_logs table...');
      await connection.query(`
        CREATE TABLE controller_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          controller_id INT NOT NULL,
          action_type ENUM('login','logout','validation','break_start','break_end') NOT NULL,
          action_details TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (controller_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_controller_id (controller_id),
          INDEX idx_timestamp (timestamp)
        )
      `);
      console.log('✅ controller_logs table created');
    } else {
      console.log('✓ controller_logs table already exists');
    }

    // Migration 5: Check and update transactions table for manual_payment type
    const [transColumns] = await connection.query(
      "SHOW COLUMNS FROM transactions WHERE Field = 'type'"
    );
    
    if (transColumns.length > 0) {
      const typeColumn = transColumns[0];
      if (!typeColumn.Type.includes('manual_payment')) {
        console.log('🔄 Adding manual_payment type to transactions table...');
        await connection.query(
          "ALTER TABLE transactions MODIFY type ENUM('recharge','payment','manual_payment') DEFAULT 'payment'"
        );
        console.log('✅ manual_payment type added to transactions table');
      } else {
        console.log('✓ manual_payment type already exists in transactions table');
      }
    }

    // Migration 6: Ensure transactions table has proper indexes
    const [indexes] = await connection.query(
      "SHOW INDEX FROM transactions WHERE Key_name = 'idx_card_id'"
    );
    
    if (indexes.length === 0) {
      console.log('🔄 Adding index to transactions table...');
      await connection.query('CREATE INDEX idx_card_id ON transactions(card_id)');
      console.log('✅ Index added to transactions table');
    } else {
      console.log('✓ Transactions table indexes already exist');
    }

    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📋 Database Schema Summary:');
    console.log('   ✓ users (with controller role)');
    console.log('   ✓ cards');
    console.log('   ✓ transactions (with manual_payment type)');
    console.log('   ✓ ticket_validations');
    console.log('   ✓ manual_payments');
    console.log('   ✓ controller_logs');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('\n✅ Database connection released');
    }
    await pool.end();
    console.log('✅ Connection pool closed');
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
