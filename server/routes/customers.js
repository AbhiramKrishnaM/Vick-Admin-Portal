import { ID_PROOF_TYPE_VALUES } from "../src/constants/idProofTypes.js";
import { CONNECTION_TYPE_VALUES } from "../src/constants/connectionTypes.js";
import { PAYMENT_METHOD_VALUES } from "../src/constants/paymentMethods.js";
import { CUSTOMER_STATUS_VALUES } from "../src/constants/customerStatuses.js";
import { ROLES } from "../src/constants/roles.js";
import {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../src/services/customer.service.js";

// [Schema]
const customerProperties = {
  name: { type: "string", minLength: 1 },
  address: { type: "string", minLength: 1 },
  id_proof_type: { type: "string", enum: ID_PROOF_TYPE_VALUES },
  phone_number: { type: "string", minLength: 1 },
  second_phone_number: { type: "string" },
  connection_types: {
    type: "array",
    items: { type: "string", enum: CONNECTION_TYPE_VALUES },
    minItems: 1,
    uniqueItems: true,
  },
  plan_type: { type: "string", minLength: 1 },
  status: { type: "string", enum: CUSTOMER_STATUS_VALUES },
  payment_method: { type: "string", enum: PAYMENT_METHOD_VALUES },
};

const requiredCustomerFields = [
  "name",
  "address",
  "id_proof_type",
  "phone_number",
  "connection_types",
  "plan_type",
  "status",
  "payment_method",
];

const idParamsSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "integer" } },
  },
};

const createCustomerSchema = {
  body: {
    type: "object",
    required: requiredCustomerFields,
    properties: customerProperties,
  },
};

const updateCustomerSchema = {
  ...idParamsSchema,
  body: {
    type: "object",
    minProperties: 1,
    properties: customerProperties,
  },
};

// [Implementation]
async function create(request, reply) {
  const customer = await createCustomer(this, request.body);
  return reply.code(201).send(customer);
}

async function list() {
  return listCustomers(this);
}

async function getOne(request, reply) {
  const customer = await getCustomerById(this, request.params.id);
  if (!customer) {
    return reply.code(404).send({ error: "Customer not found" });
  }
  return customer;
}

async function update(request, reply) {
  const customer = await updateCustomer(this, request.params.id, request.body);
  if (!customer) {
    return reply.code(404).send({ error: "Customer not found" });
  }
  return customer;
}

async function remove(request, reply) {
  const deleted = await deleteCustomer(this, request.params.id);
  if (!deleted) {
    return reply.code(404).send({ error: "Customer not found" });
  }
  return reply.code(204).send();
}

// [Registration]
async function customerRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireRole(ROLES.ADMIN));

  fastify.post("/", { schema: createCustomerSchema }, create);
  fastify.get("/", list);
  fastify.get("/:id", { schema: idParamsSchema }, getOne);
  fastify.patch("/:id", { schema: updateCustomerSchema }, update);
  fastify.delete("/:id", { schema: idParamsSchema }, remove);
}

export default customerRoutes;
