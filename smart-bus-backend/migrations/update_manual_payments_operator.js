import db from '../config/db.js';

async function updateManualPaymentsOperator() {
  const connection = await db.getConnection();
  try {
    console.log('Updating manual_payments table...');

    // Check if operator_name column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'manual_payments' 
      AND COLUMN_NAME = 'operator_name'
    `);

    if (columns.length === 0) {
      // Add operator_name column
      await connection.query(`
        ALTER TABLE manual_payments 
        ADD COLUMN operator_name VARCHAR(255) NULL AFTER operator_id
      `);
      console.log('✅ Added operator_name column to manual_payments table');
    } else {
      console.log('ℹ️ operator_name column already exists');
    }

    // Optional: Drop operator_id if you don't need it anymore
    // await connection.query(`ALTER TABLE manual_payments DROP COLUMN operator_id`);

    console.log('✅ Manual payments table updated successfully!');
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    connection.release();
    process.exit(1);
  }
}

updateManualPaymentsOperator();
