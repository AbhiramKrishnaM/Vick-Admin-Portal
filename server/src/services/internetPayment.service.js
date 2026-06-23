export async function listInternetPayments(fastify, customerId) {
  const { rows } = await fastify.pg.query(
    `SELECT * FROM internet_payments WHERE customer_id = $1 ORDER BY period_start DESC`,
    [customerId],
  );
  return rows;
}

export async function updateInternetPayment(fastify, id, data) {
  const fields = ["status", "payment_method", "paid_at"].filter((f) => f in data);
  if (fields.length === 0) return getInternetPaymentById(fastify, id);

  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`);
  const values = fields.map((f) => data[f]);

  const { rows } = await fastify.pg.query(
    `UPDATE internet_payments SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return rows[0] ?? null;
}

async function getInternetPaymentById(fastify, id) {
  const { rows } = await fastify.pg.query(
    `SELECT * FROM internet_payments WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createInitialInternetPayment(fastify, customerId, amount) {
  await fastify.pg.query(
    `INSERT INTO internet_payments (customer_id, period_start, due_date, amount, status)
     VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, 'unpaid')`,
    [customerId, amount],
  );
}

export async function generateInternetPayments(fastify) {
  const { rowCount } = await fastify.pg.query(`
    INSERT INTO internet_payments (customer_id, period_start, due_date, amount, status)
    SELECT
      c.id,
      latest.due_date,
      latest.due_date + INTERVAL '30 days',
      p.amount,
      'unpaid'
    FROM customers c
    JOIN LATERAL (
      SELECT due_date FROM internet_payments
      WHERE customer_id = c.id
      ORDER BY period_start DESC
      LIMIT 1
    ) latest ON TRUE
    JOIN plans p ON p.name = c.plan_type
    WHERE 'internet' = ANY(c.connection_types)
      AND latest.due_date <= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM internet_payments
        WHERE customer_id = c.id AND period_start = latest.due_date
      )
  `);
  return rowCount;
}
