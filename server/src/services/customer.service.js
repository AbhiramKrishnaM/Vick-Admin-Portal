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
];

export async function createCustomer(fastify, data) {
  const { rows } = await fastify.pg.query(
    `INSERT INTO customers (name, address, id_proof_type, phone_number, second_phone_number, connection_types, plan_type, status, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.name,
      data.address,
      data.id_proof_type,
      data.phone_number,
      data.second_phone_number ?? null,
      data.connection_types,
      data.plan_type,
      data.status,
      data.payment_method,
    ],
  );
  return rows[0];
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

  const setClauses = fields.map((field, index) => `${field} = $${index + 2}`);
  const values = fields.map((field) => data[field]);

  const { rows } = await fastify.pg.query(
    `UPDATE customers SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, ...values],
  );
  return rows[0] ?? null;
}

export async function deleteCustomer(fastify, id) {
  const { rowCount } = await fastify.pg.query(
    "DELETE FROM customers WHERE id = $1",
    [id],
  );
  return rowCount > 0;
}
