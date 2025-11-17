// backend/src/db/db.js
import pkg from "pg";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const { Pool } = pkg;

const pool = new Pool({
   host: process.env.PGHOST || "127.0.0.1",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || "teamboard",
  password: process.env.PGPASSWORD || "teamboard",
  database: process.env.PGDATABASE || "teamboard",
});

// optional: connect once on startup, just for logging
pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL");
    client.release(); // release client back to the pool
  })
  .catch((err) => console.error("Database connection error:", err));

export default pool;

// helper for simple queries
export function query(text, params) {
  return pool.query(text, params);
}
