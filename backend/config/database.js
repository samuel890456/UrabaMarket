import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});
