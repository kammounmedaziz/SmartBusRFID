#!/usr/bin/env node
import pool from '../config/db.js'

async function main() {
  console.log('Starting migration: enforce cards.user_id NOT NULL')
  const conn = await pool.getConnection()
  try {
    // 1) Count orphan cards
    const [orphanRows] = await conn.query('SELECT COUNT(*) AS cnt FROM cards WHERE user_id IS NULL')
    const orphanCount = orphanRows[0].cnt || 0
    console.log('Orphan cards count:', orphanCount)

    // 2) Find an admin user to reassign orphans to (non-destructive)
    if (orphanCount > 0) {
      const [admins] = await conn.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
      if (admins.length === 0) {
        console.error('No admin user found. Please create an admin or choose a user id to reassign orphan cards.')
        process.exitCode = 1
        return
      }
      const adminId = admins[0].id
      console.log('Reassigning', orphanCount, 'orphan cards to admin user id', adminId)
      const [res] = await conn.query('UPDATE cards SET user_id = ? WHERE user_id IS NULL', [adminId])
      console.log('Rows updated:', res.affectedRows)
    }

    // 3) Find existing foreign key constraint name for cards.user_id
    const [fkRows] = await conn.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'cards'
        AND COLUMN_NAME = 'user_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)
    if (fkRows.length > 0) {
      for (const row of fkRows) {
        const fkName = row.CONSTRAINT_NAME
        console.log('Dropping foreign key constraint:', fkName)
        await conn.query(`ALTER TABLE cards DROP FOREIGN KEY \`${fkName}\``)
      }
    } else {
      console.log('No existing foreign key constraint found for cards.user_id')
    }

    // 4) Make user_id NOT NULL
    console.log('Altering cards.user_id to INT NOT NULL')
    await conn.query('ALTER TABLE cards MODIFY COLUMN user_id INT NOT NULL')

    // 5) Add FK with ON DELETE CASCADE
    console.log('Adding foreign key fk_cards_user_id (user_id -> users.id) ON DELETE CASCADE')
    await conn.query('ALTER TABLE cards ADD CONSTRAINT fk_cards_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE')

    // 6) Final verification
    const [afterOrphan] = await conn.query('SELECT COUNT(*) AS cnt FROM cards WHERE user_id IS NULL')
    console.log('Orphan cards after migration:', afterOrphan[0].cnt)
    const [createRows] = await conn.query("SHOW CREATE TABLE cards")
    console.log('Show create table for cards:\n', createRows[0]['Create Table'])

    console.log('Migration completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err.message)
    process.exitCode = 1
  } finally {
    conn.release()
    // close pool
    await pool.end?.()
  }
}

main()
