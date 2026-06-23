import { ROLES } from "../src/constants/roles.js";
import { PAYMENT_METHOD_VALUES } from "../src/constants/paymentMethods.js";
import {
  listCablePayments,
  recordCablePayment,
  createInitialCablePayment,
} from "../src/services/cablePayment.service.js";

const listSchema = {
  querystring: {
    type: "object",
    required: ["customer_id"],
    properties: { customer_id: { type: "integer" } },
  },
};

const recordSchema = {
  body: {
    type: "object",
    required: ["customer_id", "amount", "payment_method"],
    properties: {
      customer_id: { type: "integer" },
      amount: { type: "integer", minimum: 1 },
      payment_method: { type: "string", enum: PAYMENT_METHOD_VALUES },
    },
  },
};

async function list(request) {
  return listCablePayments(this, request.query.customer_id);
}

async function record(request, reply) {
  const { customer_id, amount, payment_method } = request.body;
  const rows = await recordCablePayment(this, customer_id, amount, payment_method);
  return reply.code(200).send(rows);
}

const initSchema = {
  body: {
    type: "object",
    required: ["customer_id"],
    properties: { customer_id: { type: "integer" } },
  },
};

async function init(request, reply) {
  const { customer_id } = request.body;
  const { rows: existing } = await this.pg.query(
    "SELECT id FROM cable_payments WHERE customer_id = $1 LIMIT 1", [customer_id],
  );
  if (existing.length > 0) {
    return reply.code(409).send({ error: "Records already exist for this customer" });
  }
  const { rows: customerRows } = await this.pg.query(
    "SELECT * FROM customers WHERE id = $1", [customer_id],
  );
  if (!customerRows.length) return reply.code(404).send({ error: "Customer not found" });
  const { cable_amount } = customerRows[0];
  if (!cable_amount) return reply.code(400).send({ error: "Customer has no cable amount set" });
  await createInitialCablePayment(this, customer_id, cable_amount);
  return reply.code(201).send(await listCablePayments(this, customer_id));
}

async function cablePaymentRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireRole(ROLES.ADMIN));
  fastify.get("/", { schema: listSchema }, list);
  fastify.post("/record", { schema: recordSchema }, record);
  fastify.post("/init", { schema: initSchema }, init);
}

export default cablePaymentRoutes;
