import { createInitialInternetPayment } from "./internetPayment.service.js";
import { createInitialCablePayment } from "./cablePayment.service.js";

const CUSTOMER_FIELDS = [
  "name",
  "address",
  "id_proof_type",
  "phone_number",
  "second_phone_number",
  "connection_types",
  "plan_type",
  "status",
  "payment_method",
  "cable_amount",
];

export async function createCustomer(fastify, data) {
  const client = await fastify.pg.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO customers
         (name, address, id_proof_type, phone_number, second_phone_number,
          connection_types, plan_type, status, payment_method, cable_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.name,
        data.address,
        data.id_proof_type,
        data.phone_number,
        data.second_phone_number ?? null,
        data.connection_types,
        data.plan_type ?? null,
        data.status,
        data.payment_method,
        data.cable_amount ?? null,
      ],
    );
    const customer = rows[0];

    if (customer.connection_types.includes("internet")) {
      const { rows: planRows } = await client.query(
        `SELECT amount FROM plans WHERE name = $1 LIMIT 1`,
        [customer.plan_type],
      );
      if (planRows.length > 0) {
        await client.query(
          `INSERT INTO internet_payments (customer_id, period_start, due_date, amount, status)
           VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, 'unpaid')`,
          [customer.id, planRows[0].amount],
        );
      }
    }

    if (customer.connection_types.includes("cable") && customer.cable_amount) {
      await client.query(
        `INSERT INTO cable_payments (customer_id, period_start, due_date, amount_due, amount_paid, pending)
         VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, 0, $2)`,
        [customer.id, customer.cable_amount],
      );
    }

    await client.query("COMMIT");
    return customer;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listCustomers(fastify) {
  const { rows } = await fastify.pg.query(
    "SELECT * FROM customers ORDER BY id",
  );
  return rows;
}

export async function getCustomerById(fastify, id) {
  const { rows } = await fastify.pg.query(
    "SELECT * FROM customers WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function updateCustomer(fastify, id, data) {
  const fields = CUSTOMER_FIELDS.filter((field) => field in data);
  if (fields.length === 0) {
    return getCustomerById(fastify, id);
  }

  const client = await fastify.pg.connect();
  try {
    await client.query("BEGIN");

    const { rows: oldRows } = await client.query(
      "SELECT * FROM customers WHERE id = $1", [id],
    );
    const old = oldRows[0];

    const setClauses = fields.map((field, index) => `${field} = $${index + 2}`);
    const values = fields.map((field) => data[field]);
    const { rows } = await client.query(
      `UPDATE customers SET ${setClauses.join(", ")}, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    const updated = rows[0];
    if (!updated) { await client.query("ROLLBACK"); return null; }

    const newTypes = updated.connection_types;
    const oldTypes = old?.connection_types ?? [];

    if (newTypes.includes("internet") && !oldTypes.includes("internet")) {
      const { rows: planRows } = await client.query(
        "SELECT amount FROM plans WHERE name = $1 LIMIT 1", [updated.plan_type],
      );
      if (planRows.length > 0) {
        await client.query(
          `INSERT INTO internet_payments (customer_id, period_start, due_date, amount, status)
           VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, 'unpaid')
           ON CONFLICT DO NOTHING`,
          [updated.id, planRows[0].amount],
        );
      }
    }

    if (newTypes.includes("cable") && !oldTypes.includes("cable") && updated.cable_amount) {
      await client.query(
        `INSERT INTO cable_payments (customer_id, period_start, due_date, amount_due, amount_paid, pending)
         VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, 0, $2)
         ON CONFLICT DO NOTHING`,
        [updated.id, updated.cable_amount],
      );
    }

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteCustomer(fastify, id) {
  const { rowCount } = await fastify.pg.query(
    "DELETE FROM customers WHERE id = $1",
    [id],
  );
  return rowCount > 0;
}
