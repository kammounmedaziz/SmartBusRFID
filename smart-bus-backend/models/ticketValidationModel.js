import db from "../config/db.js";

export const create = async ({ card_id, controller_id, location, status, fare_amount }) => {
  const [result] = await db.query(
    "INSERT INTO ticket_validations (card_id, controller_id, location, status, fare_amount) VALUES (?, ?, ?, ?, ?)",
    [card_id, controller_id, location, status, fare_amount]
  );
  return result.insertId;
};

export const getAll = async () => {
  const [rows] = await db.query(
    `SELECT tv.*, c.uid as card_uid, u.name as controller_name
     FROM ticket_validations tv
     LEFT JOIN cards c ON c.id = tv.card_id
     LEFT JOIN users u ON u.id = tv.controller_id
     ORDER BY tv.validation_time DESC`
  );
  return rows;
};

export const getByControllerId = async (controller_id) => {
  const [rows] = await db.query(
    `SELECT tv.*, c.uid as card_uid, u.name as user_name
     FROM ticket_validations tv
     LEFT JOIN cards c ON c.id = tv.card_id
     LEFT JOIN users u ON u.id = c.user_id
     WHERE tv.controller_id = ?
     ORDER BY tv.validation_time DESC`,
    [controller_id]
  );
  return rows;
};

export const getByCardId = async (card_id) => {
  const [rows] = await db.query(
    `SELECT tv.*, u.name as controller_name
     FROM ticket_validations tv
     LEFT JOIN users u ON u.id = tv.controller_id
     WHERE tv.card_id = ?
     ORDER BY tv.validation_time DESC`,
    [card_id]
  );
  return rows;
};

export const getRecentValidations = async (limit = 50) => {
  const [rows] = await db.query(
    `SELECT tv.*, c.uid as card_uid, u1.name as controller_name, u2.name as user_name
     FROM ticket_validations tv
     LEFT JOIN cards c ON c.id = tv.card_id
     LEFT JOIN users u1 ON u1.id = tv.controller_id
     LEFT JOIN users u2 ON u2.id = c.user_id
     ORDER BY tv.validation_time DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

export default { create, getAll, getByControllerId, getByCardId, getRecentValidations };
