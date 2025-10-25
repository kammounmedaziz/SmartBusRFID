import db from "../config/db.js";

export const log = async ({ controller_id, action_type, details }) => {
  const [result] = await db.query(
    "INSERT INTO controller_logs (controller_id, action_type, details) VALUES (?, ?, ?)",
    [controller_id, action_type, details]
  );
  return result.insertId;
};

export const getByControllerId = async (controller_id, limit = 100) => {
  const [rows] = await db.query(
    `SELECT * FROM controller_logs
     WHERE controller_id = ?
     ORDER BY action_time DESC
     LIMIT ?`,
    [controller_id, limit]
  );
  return rows;
};

export const getRecent = async (limit = 100) => {
  const [rows] = await db.query(
    `SELECT cl.*, u.name as controller_name, u.email as controller_email
     FROM controller_logs cl
     LEFT JOIN users u ON u.id = cl.controller_id
     ORDER BY cl.action_time DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

export const getControllerStats = async (controller_id) => {
  const [rows] = await db.query(
    `SELECT 
       COUNT(*) as total_actions,
       SUM(CASE WHEN action_type = 'validation' THEN 1 ELSE 0 END) as validations_count,
       MIN(action_time) as first_action,
       MAX(action_time) as last_action
     FROM controller_logs
     WHERE controller_id = ?`,
    [controller_id]
  );
  return rows[0];
};

export default { log, getByControllerId, getRecent, getControllerStats };
