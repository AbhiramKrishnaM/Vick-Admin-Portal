import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
const schema = readFileSync(schemaPath, "utf-8");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(schema);

console.log("Schema applied");
await client.end();
