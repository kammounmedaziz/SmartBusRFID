import fs from 'fs';
import path from 'path';
import db from './config/db.js';

const runSqlFile = async (filePath) => {
  let sql = fs.readFileSync(filePath, 'utf8');
  // Remove block comments /* ... */
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments that start with -- (MySQL requires a space after --)
  sql = sql.split(/\r?\n/).filter(line => !/^\s*--/.test(line)).join('\n');

  // naive split by semicolon - handles our files once comments are removed
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      // Skip lone USE statements when using pool config that already set database
      if (/^USE\s+/i.test(stmt)) {
        console.log('Skipping USE statement (handled by pool config)');
        continue;
      }
      console.log(`\n--- Executing statement #${i + 1} (full):`);
      console.log(stmt);
      await db.query(stmt);
    } catch (err) {
      console.error('Error executing statement:', err.message);
      console.error('Failed statement #', i + 1, 'content:\n', stmt);
      // continue executing other statements
    }
  }
};

const main = async () => {
  try {
    console.log('\n🗄️ Starting seed runner...');
    const sqlFile = path.join(process.cwd(), 'sql.sql');
    const seedFile = path.join(process.cwd(), 'seed-trips.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error('sql.sql not found');
      process.exit(1);
    }

    await runSqlFile(sqlFile);

    if (fs.existsSync(seedFile)) {
      await runSqlFile(seedFile);
    } else {
      console.log('No seed-trips.sql found, skipping seeding');
    }

    console.log('\n✅ Seed runner finished');
    process.exit(0);
  } catch (err) {
    console.error('Seed runner failed:', err);
    process.exit(1);
  }
};

main();
