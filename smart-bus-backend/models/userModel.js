import db from "../config/db.js";

export const create = async ({ name, email, password_hash, role = 'operator' }) => {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, password_hash, role]
  );
  return result.insertId;
};

export const getAll = async () => {
  const [rows] = await db.query('SELECT id, name, email, role FROM users');
  return rows;
};

export const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
};

export const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] ?? null;
};

export const existsByEmail = async (email) => {
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  return rows.length > 0;
};

export default { create, getAll, findByEmail, findById, existsByEmail };
