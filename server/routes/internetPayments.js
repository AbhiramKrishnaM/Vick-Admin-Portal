import { ROLES } from "../src/constants/roles.js";
import { PAYMENT_METHOD_VALUES } from "../src/constants/paymentMethods.js";
import {
  listInternetPayments,
  updateInternetPayment,
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

async function internetPaymentRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireRole(ROLES.ADMIN));
  fastify.get("/", { schema: listSchema }, list);
  fastify.patch("/:id", { schema: updateSchema }, update);
}

export default internetPaymentRoutes;
