import "dotenv/config";
import pg from "pg";
import bcrypt from "bcrypt";
import { ROLES } from "../src/constants/roles.js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node db/seed-admin.js <email> <password>");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const passwordHash = await bcrypt.hash(password, 10);

await client.query(
  `INSERT INTO users (email, password_hash, role)
   VALUES ($1, $2, $3)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
  [email, passwordHash, ROLES.ADMIN],
);

console.log(`Admin user ready: ${email}`);
await client.end();
