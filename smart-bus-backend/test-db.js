// test-db.js
import db from "./config/db.js";

const testConnection = async () => {
  try {
    console.log("Running sanity queries...");
    const [rows1] = await db.query("SELECT 1 AS ok");
    console.log("✅ Simple SELECT result:", rows1[0]);

    const [ver] = await db.query("SELECT VERSION() AS version");
    console.log("🛠️ DB version:", ver[0].version);

    // try NOW() in a second step to reproduce original test
  const [rows] = await db.query("SELECT NOW() AS now_time");
  console.log("✅ Database connection successful!");
  console.log("🕒 Current DB time:", rows[0].now_time);
    process.exit(0);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

testConnection();
