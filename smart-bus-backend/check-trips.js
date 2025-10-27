import db from './config/db.js';

const main = async () => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as cnt FROM trips');
    console.log('Trips count:', rows[0].cnt);
    const [sample] = await db.query('SELECT id, from_city, to_city, departure_time, price FROM trips LIMIT 5');
    console.log('Sample rows:', sample);
    process.exit(0);
  } catch (err) {
    console.error('Error querying trips:', err.message);
    process.exit(1);
  }
};

main();
