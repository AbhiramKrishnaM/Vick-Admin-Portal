import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

const schema = {
  type: "object",
  required: ["DATABASE_URL", "JWT_SECRET"],
  properties: {
    DATABASE_URL: { type: "string" },
    JWT_SECRET: { type: "string" },
    PORT: { type: "number", default: 3000 },
    HOST: { type: "string", default: "127.0.0.1" },
  },
};

export default fp(async function envPlugin(fastify) {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  });
});
