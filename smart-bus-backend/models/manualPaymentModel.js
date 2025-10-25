import db from "../config/db.js";

export const create = async ({ user_id, amount, payment_method, card_id, operator_name, notes }) => {
  const [result] = await db.query(
    "INSERT INTO manual_payments (user_id, amount, payment_method, card_id, operator_name, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [user_id, amount, payment_method, card_id, operator_name, notes]
  );
  return result.insertId;
};

export const getAll = async () => {
  const [rows] = await db.query(
    `SELECT mp.*, u.name as user_name, u.email as user_email, 
            v.name as verified_by_name
     FROM manual_payments mp
     LEFT JOIN users u ON u.id = mp.user_id
     LEFT JOIN users v ON v.id = mp.verified_by
     ORDER BY mp.payment_time DESC`
  );
  return rows;
};

export const getByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT mp.*, 
            v.name as verified_by_name,
            c.uid as card_uid
     FROM manual_payments mp
     LEFT JOIN users v ON v.id = mp.verified_by
     LEFT JOIN cards c ON c.id = mp.card_id
     WHERE mp.user_id = ?
     ORDER BY mp.payment_time DESC`,
    [user_id]
  );
  return rows;
};

export const getPending = async () => {
  const [rows] = await db.query(
    `SELECT mp.*, u.name as user_name, u.email as user_email
     FROM manual_payments mp
     LEFT JOIN users u ON u.id = mp.user_id
     WHERE mp.status = 'pending'
     ORDER BY mp.payment_time ASC`
  );
  return rows;
};

export const updateStatus = async (id, status, verified_by) => {
  await db.query(
    "UPDATE manual_payments SET status = ?, verified_by = ? WHERE id = ?",
    [status, verified_by, id]
  );
};

export default { create, getAll, getByUserId, getPending, updateStatus };
