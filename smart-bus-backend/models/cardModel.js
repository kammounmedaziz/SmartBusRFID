import db from "../config/db.js";

export const getAll = async () => {
  const [rows] = await db.query("SELECT * FROM cards");
  return rows;
};

export const findByUid = async (uid) => {
  const [rows] = await db.query("SELECT * FROM cards WHERE uid = ?", [uid]);
  return rows[0] ?? null;
};

export const findById = async (id) => {
  const [rows] = await db.query("SELECT * FROM cards WHERE id = ?", [id]);
  return rows[0] ?? null;
};

export const findByUserId = async (user_id) => {
  const [rows] = await db.query("SELECT * FROM cards WHERE user_id = ?", [user_id]);
  return rows;
};

export const updateBalanceByUid = async (uid, newBalance) => {
  await db.query("UPDATE cards SET balance = ? WHERE uid = ?", [newBalance, uid]);
};

export const createCard = async ({ uid, user_id = null, balance = 0, status = "active" }) => {
  const [result] = await db.query(
    "INSERT INTO cards (uid, user_id, balance, status) VALUES (?, ?, ?, ?)",
    [uid, user_id, balance, status]
  );
  return result.insertId;
};

export default { getAll, findByUid, findById, findByUserId, updateBalanceByUid, createCard };
