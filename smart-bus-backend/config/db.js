// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
  });

  console.log("✅ MariaDB connection pool created.");
} catch (error) {
  console.error("❌ Error creating MariaDB connection pool:", error);
}

export default pool;
