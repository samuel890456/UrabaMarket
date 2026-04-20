import { pool } from "../config/database.js";

export async function getHealthStatus() {
  let database = "disconnected";
  try {
    await pool.query("SELECT 1");
    database = "connected";
  } catch {
    database = "error";
  }

  return {
    service: "urabamarket-api",
    status: "ok",
    database,
    timestamp: new Date().toISOString()
  };
}
