import { ROLES } from "../src/constants/roles.js";
import { PAYMENT_METHOD_VALUES } from "../src/constants/paymentMethods.js";
import {
  listCablePayments,
  recordCablePayment,
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

async function cablePaymentRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireRole(ROLES.ADMIN));
  fastify.get("/", { schema: listSchema }, list);
  fastify.post("/record", { schema: recordSchema }, record);
}

export default cablePaymentRoutes;
