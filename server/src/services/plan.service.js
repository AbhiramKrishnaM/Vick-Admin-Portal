const PLAN_FIELDS = ["category", "name", "speed", "fup", "validity", "amount"];

export async function createPlan(fastify, data) {
  const { rows } = await fastify.pg.query(
    `INSERT INTO plans (category, name, speed, fup, validity, amount)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.category,
      data.name,
      data.speed,
      data.fup,
      data.validity ?? null,
      data.amount,
    ],
  );
  return rows[0];
}

export async function listPlans(fastify) {
  const { rows } = await fastify.pg.query(
    "SELECT * FROM plans ORDER BY category, id",
  );
  return rows;
}

export async function getPlanById(fastify, id) {
  const { rows } = await fastify.pg.query(
    "SELECT * FROM plans WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function updatePlan(fastify, id, data) {
  const fields = PLAN_FIELDS.filter((field) => field in data);
  if (fields.length === 0) {
    return getPlanById(fastify, id);
  }

  const setClauses = fields.map((field, index) => `${field} = $${index + 2}`);
  const values = fields.map((field) => data[field]);

  const { rows } = await fastify.pg.query(
    `UPDATE plans SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, ...values],
  );
  return rows[0] ?? null;
}

export async function deletePlan(fastify, id) {
  const { rowCount } = await fastify.pg.query(
    "DELETE FROM plans WHERE id = $1",
    [id],
  );
  return rowCount > 0;
}
