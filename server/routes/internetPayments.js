import { ROLES } from "../src/constants/roles.js";
import { PAYMENT_METHOD_VALUES } from "../src/constants/paymentMethods.js";
import {
  listInternetPayments,
  updateInternetPayment,
  createInitialInternetPayment,
} from "../src/services/internetPayment.service.js";

const listSchema = {
  querystring: {
    type: "object",
    required: ["customer_id"],
    properties: { customer_id: { type: "integer" } },
  },
};

const updateSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "integer" } },
  },
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      status: { type: "string", enum: ["paid", "unpaid"] },
      payment_method: { type: "string", enum: PAYMENT_METHOD_VALUES },
      paid_at: { type: "string", format: "date-time", nullable: true },
    },
  },
};

async function list(request) {
  return listInternetPayments(this, request.query.customer_id);
}

async function update(request, reply) {
  const payment = await updateInternetPayment(this, request.params.id, request.body);
  if (!payment) return reply.code(404).send({ error: "Payment not found" });
  return payment;
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
    "SELECT id FROM internet_payments WHERE customer_id = $1 LIMIT 1", [customer_id],
  );
  if (existing.length > 0) {
    return reply.code(409).send({ error: "Records already exist for this customer" });
  }
  const { rows: customerRows } = await this.pg.query(
    "SELECT c.*, p.amount FROM customers c JOIN plans p ON p.name = c.plan_type WHERE c.id = $1", [customer_id],
  );
  if (!customerRows.length) return reply.code(404).send({ error: "Customer not found" });
  await createInitialInternetPayment(this, customer_id, customerRows[0].amount);
  return reply.code(201).send(await listInternetPayments(this, customer_id));
}

async function internetPaymentRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireRole(ROLES.ADMIN));
  fastify.get("/", { schema: listSchema }, list);
  fastify.patch("/:id", { schema: updateSchema }, update);
  fastify.post("/init", { schema: initSchema }, init);
}

export default internetPaymentRoutes;
