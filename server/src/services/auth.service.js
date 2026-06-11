import bcrypt from "bcrypt";

export async function findUserByEmail(fastify, email) {
  const { rows } = await fastify.pg.query(
    "SELECT id, email, password_hash, role FROM users WHERE email = $1",
    [email],
  );
  return rows[0] ?? null;
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
