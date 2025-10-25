import db from './config/db.js';
import bcrypt from 'bcrypt';

// Generate random date within last 30 days
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random amount
const randomAmount = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// Random element from array
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE controller_logs');
    await db.query('TRUNCATE TABLE manual_payments');
    await db.query('TRUNCATE TABLE ticket_validations');
    await db.query('TRUNCATE TABLE transactions');
    await db.query('TRUNCATE TABLE cards');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Database cleared\n');

    // Date range: last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // 1. Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { name: 'Admin User', password_hash: hashedPassword, role: 'admin', email: 'admin@smartbus.dz' },
      { name: 'Operator One', password_hash: hashedPassword, role: 'operator', email: 'operator1@smartbus.dz' },
      { name: 'Operator Two', password_hash: hashedPassword, role: 'operator', email: 'operator2@smartbus.dz' },
      { name: 'Controller One', password_hash: hashedPassword, role: 'controller', email: 'controller1@smartbus.dz' },
      { name: 'Controller Two', password_hash: hashedPassword, role: 'controller', email: 'controller2@smartbus.dz' },
      { name: 'Controller Three', password_hash: hashedPassword, role: 'controller', email: 'controller3@smartbus.dz' },
    ];

    // Regular users (passengers)
    const firstNames = ['Ahmed', 'Fatima', 'Mohamed', 'Amina', 'Youssef', 'Khadija', 'Ali', 'Zahra', 'Omar', 'Leila', 'Karim', 'Nadia', 'Hassan', 'Samira', 'Rachid'];
    const lastNames = ['Benali', 'Bouazza', 'Cherif', 'Djebbar', 'El-Amine', 'Fenniche', 'Ghazi', 'Hamza', 'Ibrahim', 'Kadri', 'Lounis', 'Mansouri', 'Naceur', 'Ouali', 'Rami'];
    
    for (let i = 0; i < 50; i++) {
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      users.push({
        name: `${firstName} ${lastName}`,
        password_hash: hashedPassword,
        role: 'user',
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.dz`
      });
    }

    const userResults = [];
    for (const user of users) {
      const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.password_hash, user.role]
      );
      userResults.push({ id: result.insertId, ...user });
    }
    console.log(`✅ Created ${userResults.length} users\n`);

    // Get user IDs by role
    const regularUsers = userResults.filter(u => u.role === 'user');
    const controllers = userResults.filter(u => u.role === 'controller');
    const operators = userResults.filter(u => u.role === 'operator');
    const adminUser = userResults.find(u => u.role === 'admin');

    // 2. Create Cards
    console.log('💳 Creating RFID cards...');
    const cards = [];
    
    for (let i = 0; i < regularUsers.length; i++) {
      const user = regularUsers[i];
      const numCards = Math.random() < 0.7 ? 1 : 2; // 70% have 1 card, 30% have 2 cards
      
      for (let j = 0; j < numCards; j++) {
        const uid = `RFID${String(i * 10 + j).padStart(8, '0')}`;
        const balance = parseFloat(randomAmount(50, 500));
        const status = Math.random() < 0.95 ? 'active' : 'blocked'; // 95% active cards
        
        const [result] = await db.query(
          'INSERT INTO cards (uid, user_id, balance, status) VALUES (?, ?, ?, ?)',
          [uid, user.id, balance, status]
        );
        cards.push({ id: result.insertId, uid, user_id: user.id, balance, status });
      }
    }
    console.log(`✅ Created ${cards.length} RFID cards\n`);

    // 3. Create Transactions (Recharges and Payments)
    console.log('💰 Creating transactions...');
    let transactionCount = 0;

    for (const card of cards) {
      // Generate 5-20 transactions per card over 30 days
      const numTransactions = Math.floor(Math.random() * 16) + 5;
      
      for (let i = 0; i < numTransactions; i++) {
        const transactionDate = randomDate(startDate, endDate);
        const type = Math.random() < 0.3 ? 'recharge' : 'payment'; // 30% recharges, 70% payments
        
        let amount;
        if (type === 'recharge') {
          amount = parseFloat(randomChoice(['50', '100', '200', '300', '500']));
        } else {
          amount = parseFloat(randomChoice(['30', '40', '50'])); // Ticket prices
        }

        await db.query(
          'INSERT INTO transactions (card_id, type, amount, timestamp) VALUES (?, ?, ?, ?)',
          [card.id, type, amount, transactionDate]
        );
        transactionCount++;
      }
    }
    console.log(`✅ Created ${transactionCount} transactions\n`);

    // 4. Create Ticket Validations
    console.log('🎫 Creating ticket validations...');
    let validationCount = 0;
    const fareAmount = 40; // Standard fare
    const locations = ['Station A', 'Station B', 'Station C', 'Central Terminal', 'North Hub', 'South Hub'];

    for (const card of cards) {
      // Generate 10-30 validations per active card
      if (card.status !== 'active') continue;
      
      const numValidations = Math.floor(Math.random() * 21) + 10;
      
      for (let i = 0; i < numValidations; i++) {
        const validationDate = randomDate(startDate, endDate);
        const controller = randomChoice(controllers);
        const location = randomChoice(locations);
        
        // 90% successful, 10% failed
        const status = Math.random() < 0.9 ? 'success' : 'failed';
        
        await db.query(
          'INSERT INTO ticket_validations (card_id, controller_id, validation_time, location, status, fare_amount) VALUES (?, ?, ?, ?, ?, ?)',
          [card.id, controller.id, validationDate, location, status, status === 'success' ? fareAmount : 0]
        );
        validationCount++;
      }
    }
    console.log(`✅ Created ${validationCount} ticket validations\n`);

    // 5. Create Manual Payments
    console.log('💵 Creating manual payments...');
    const paymentMethods = ['cash', 'card', 'mobile'];
    const paymentStatuses = ['verified', 'verified', 'verified', 'pending', 'rejected']; // 60% verified, 20% pending, 20% rejected
    
    for (let i = 0; i < 100; i++) {
      const user = randomChoice(regularUsers);
      const paymentDate = randomDate(startDate, endDate);
      const amount = parseFloat(randomChoice(['50', '100', '150', '200']));
      const method = randomChoice(paymentMethods);
      const status = randomChoice(paymentStatuses);
      const referenceNumber = method !== 'cash' ? `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null;
      
      let verifiedBy = null;
      let verifiedAt = null;
      
      if (status !== 'pending') {
        verifiedBy = Math.random() < 0.5 ? adminUser.id : randomChoice(operators).id;
        verifiedAt = new Date(paymentDate.getTime() + Math.random() * 86400000 * 2); // Verified within 2 days
      }

      await db.query(
        'INSERT INTO manual_payments (user_id, amount, payment_method, reference_number, status, verified_by, verified_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, amount, method, referenceNumber, status, verifiedBy, verifiedAt, paymentDate]
      );
    }
    console.log(`✅ Created 100 manual payments\n`);

    // 6. Create Controller Logs
    console.log('📋 Creating controller logs...');
    const logActions = ['login', 'logout', 'validation', 'break_start', 'break_end'];

    for (const controller of controllers) {
      // Each controller has 40-80 log entries
      const numLogs = Math.floor(Math.random() * 41) + 40;
      
      for (let i = 0; i < numLogs; i++) {
        const logDate = randomDate(startDate, endDate);
        const actionType = randomChoice(logActions);
        const actionDetails = `Action performed: ${actionType} at ${logDate.toLocaleString()}`;

        await db.query(
          'INSERT INTO controller_logs (controller_id, action_type, action_details, timestamp) VALUES (?, ?, ?, ?)',
          [controller.id, actionType, actionDetails, logDate]
        );
      }
    }
    console.log(`✅ Created controller logs\n`);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${userResults.length} (${regularUsers.length} passengers, ${controllers.length} controllers, ${operators.length} operators, 1 admin)`);
    console.log(`   - Cards: ${cards.length}`);
    console.log(`   - Transactions: ${transactionCount}`);
    console.log(`   - Validations: ${validationCount}`);
    console.log(`   - Manual Payments: 100`);
    console.log(`   - Controller Logs: ${controllers.length * 60} (approx)`);
    console.log('\n💡 Default password for all users: password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
