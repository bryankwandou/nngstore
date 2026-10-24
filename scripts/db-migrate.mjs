// Applies db/schema.sql. Uses the direct (unpooled) connection, which is the
// right one for DDL. Run: node --env-file=.env.local scripts/db-migrate.mjs
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set.");
  process.exit(1);
}

const sql = neon(url);
const text = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = text
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);

for (const s of statements) await sql.query(s);
const [{ count }] = await sql.query("select count(*)::int as count from orders");
console.log(`schema ok, orders table has ${count} rows`);
