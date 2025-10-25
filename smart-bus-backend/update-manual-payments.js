import db from './config/db.js';

async function updateManualPaymentsTable() {
  try {
    console.log('Starting database migration...');
    
    // Add columns if they don't exist
    const addColumns = `
      ALTER TABLE manual_payments 
      ADD COLUMN IF NOT EXISTS operator_id INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS card_id INT DEFAULT NULL
    `;
    
    await db.query(addColumns);
    console.log('✅ Columns added successfully');
    
    // Add foreign key constraints
    try {
      await db.query('ALTER TABLE manual_payments ADD CONSTRAINT fk_manual_operator FOREIGN KEY (operator_id) REFERENCES users(id)');
      console.log('✅ Operator foreign key added');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('⏭️  Operator foreign key already exists');
      } else {
        console.error('❌ Error adding operator foreign key:', err.message);
      }
    }
    
    try {
      await db.query('ALTER TABLE manual_payments ADD CONSTRAINT fk_manual_card FOREIGN KEY (card_id) REFERENCES cards(id)');
      console.log('✅ Card foreign key added');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('⏭️  Card foreign key already exists');
      } else {
        console.error('❌ Error adding card foreign key:', err.message);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

updateManualPaymentsTable();
