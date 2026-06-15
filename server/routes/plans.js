import { PLAN_CATEGORY_VALUES } from "../src/constants/planCategories.js";
import { ROLES } from "../src/constants/roles.js";
import {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../src/services/plan.service.js";

// [Schema]
const planProperties = {
  category: { type: "string", enum: PLAN_CATEGORY_VALUES },
  name: { type: "string", minLength: 1 },
  speed: { type: "string", minLength: 1 },
  fup: { type: "string", minLength: 1 },
  validity: { type: "string" },
  amount: { type: "integer", minimum: 0 },
};

const requiredPlanFields = ["category", "name", "speed", "fup", "amount"];

const idParamsSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "integer" } },
  },
};

const createPlanSchema = {
  body: {
    type: "object",
    required: requiredPlanFields,
    properties: planProperties,
  },
};

const updatePlanSchema = {
  ...idParamsSchema,
  body: {
    type: "object",
    minProperties: 1,
    properties: planProperties,
  },
};

// [Implementation]
async function create(request, reply) {
  const plan = await createPlan(this, request.body);
  return reply.code(201).send(plan);
}

async function list() {
  return listPlans(this);
}

async function getOne(request, reply) {
  const plan = await getPlanById(this, request.params.id);
  if (!plan) {
    return reply.code(404).send({ error: "Plan not found" });
  }
  return plan;
}

async function update(request, reply) {
  const plan = await updatePlan(this, request.params.id, request.body);
  if (!plan) {
    return reply.code(404).send({ error: "Plan not found" });
  }
  return plan;
}

async function remove(request, reply) {
  const deleted = await deletePlan(this, request.params.id);
  if (!deleted) {
    return reply.code(404).send({ error: "Plan not found" });
  }
  return reply.code(204).send();
}

// [Registration]
async function planRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireRole(ROLES.ADMIN));

  fastify.post("/", { schema: createPlanSchema }, create);
  fastify.get("/", list);
  fastify.get("/:id", { schema: idParamsSchema }, getOne);
  fastify.patch("/:id", { schema: updatePlanSchema }, update);
  fastify.delete("/:id", { schema: idParamsSchema }, remove);
}

export default planRoutes;
