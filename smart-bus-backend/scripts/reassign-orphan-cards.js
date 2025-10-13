#!/usr/bin/env node
import pool from '../config/db.js'

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: node reassign-orphan-cards.js <user_id>')
    process.exit(2)
  }
  const userId = Number(args[0])
  if (!userId || userId <= 0) {
    console.error('Please provide a valid numeric user id')
    process.exit(2)
  }

  const conn = await pool.getConnection()
  try {
    console.log('Counting orphan cards...')
    const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM cards WHERE user_id IS NULL')
    console.log('Orphan cards before:', rows[0].cnt)

    console.log('Reassigning orphan cards to user id', userId)
    const [res] = await conn.query('UPDATE cards SET user_id = ? WHERE user_id IS NULL', [userId])
    console.log('Rows affected:', res.affectedRows)

    const [rows2] = await conn.query('SELECT COUNT(*) AS cnt FROM cards WHERE user_id IS NULL')
    console.log('Orphan cards after:', rows2[0].cnt)
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    conn.release()
    process.exit(0)
  }
}

main()
