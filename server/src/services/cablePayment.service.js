export async function listCablePayments(fastify, customerId) {
  const { rows } = await fastify.pg.query(
    `SELECT * FROM cable_payments WHERE customer_id = $1 ORDER BY period_start DESC`,
    [customerId],
  );
  return rows;
}

export async function recordCablePayment(fastify, customerId, totalAmount, paymentMethod) {
  const client = await fastify.pg.connect();
  try {
    await client.query("BEGIN");

    const { rows: unpaidRows } = await client.query(
      `SELECT * FROM cable_payments
       WHERE customer_id = $1 AND pending > 0
       ORDER BY period_start ASC`,
      [customerId],
    );

    let remaining = totalAmount;
    for (const row of unpaidRows) {
      if (remaining <= 0) break;
      const apply = Math.min(remaining, row.pending);
      const newAmountPaid = row.amount_paid + apply;
      const newPending = row.amount_due - newAmountPaid;
      await client.query(
        `UPDATE cable_payments
         SET amount_paid = $1, pending = $2, payment_method = $3,
             paid_at = CASE WHEN $2 = 0 THEN now() ELSE paid_at END
         WHERE id = $4`,
        [newAmountPaid, newPending, paymentMethod, row.id],
      );
      remaining -= apply;
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return listCablePayments(fastify, customerId);
}

export async function createInitialCablePayment(fastify, customerId, cableAmount) {
  await fastify.pg.query(
    `INSERT INTO cable_payments (customer_id, period_start, due_date, amount_due, amount_paid, pending)
     VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, 0, $2)`,
    [customerId, cableAmount],
  );
}

export async function generateCablePayments(fastify) {
  const { rowCount } = await fastify.pg.query(`
    INSERT INTO cable_payments (customer_id, period_start, due_date, amount_due, amount_paid, pending)
    SELECT
      c.id,
      latest.due_date,
      latest.due_date + INTERVAL '30 days',
      c.cable_amount,
      0,
      c.cable_amount
    FROM customers c
    JOIN LATERAL (
      SELECT due_date FROM cable_payments
      WHERE customer_id = c.id
      ORDER BY period_start DESC
      LIMIT 1
    ) latest ON TRUE
    WHERE 'cable' = ANY(c.connection_types)
      AND c.cable_amount IS NOT NULL
      AND latest.due_date <= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM cable_payments
        WHERE customer_id = c.id AND period_start = latest.due_date
      )
  `);
  return rowCount;
}
