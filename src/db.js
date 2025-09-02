import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Erro encontrado: ", err);
  process.exit(1);
});

export async function query(text, params) {
  return pool.query(text, params);
}
