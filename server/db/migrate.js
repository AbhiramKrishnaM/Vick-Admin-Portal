import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

const migrationsDir = fileURLToPath(new URL("./migrations", import.meta.url));
const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const { rows } = await client.query("SELECT name FROM schema_migrations");
const applied = new Set(rows.map((row) => row.name));

for (const file of files) {
  if (applied.has(file)) continue;

  const sql = readFileSync(`${migrationsDir}/${file}`, "utf-8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
      file,
    ]);
    await client.query("COMMIT");
    console.log(`Applied ${file}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

await client.end();
