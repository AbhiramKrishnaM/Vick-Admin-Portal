import fp from "fastify-plugin";
import fastifyPostgres from "@fastify/postgres";

export default fp(async function dbPlugin(fastify) {
  await fastify.register(fastifyPostgres, {
    connectionString: fastify.config.DATABASE_URL,
  });
});
