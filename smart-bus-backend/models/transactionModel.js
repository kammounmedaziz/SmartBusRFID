import db from "../config/db.js";

export const create = async ({ card_id, amount, type }) => {
  const [result] = await db.query(
    "INSERT INTO transactions (card_id, amount, type) VALUES (?, ?, ?)",
    [card_id, amount, type]
  );
  return result.insertId;
};

export const getAll = async () => {
  const [rows] = await db.query(
    `SELECT t.id, t.card_id, t.amount, t.type, t.timestamp, c.uid as card_uid
     FROM transactions t
     LEFT JOIN cards c ON c.id = t.card_id
     ORDER BY t.timestamp DESC`
  );
  return rows;
};

export const getByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT t.id, t.card_id, t.amount, t.type, t.timestamp, c.uid as card_uid
     FROM transactions t
     JOIN cards c ON c.id = t.card_id
     WHERE c.user_id = ?
     ORDER BY t.timestamp DESC`,
    [user_id]
  );
  return rows;
};

export default { create, getAll, getByUserId };
