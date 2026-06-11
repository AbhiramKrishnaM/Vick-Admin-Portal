import Fastify from "fastify";
import envPlugin from "./src/plugins/env.js";
import dbPlugin from "./src/plugins/db.js";
import jwtPlugin from "./src/plugins/jwt.js";
import auth from "./routes/auth.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(envPlugin);
await fastify.register(dbPlugin);
await fastify.register(jwtPlugin);
await fastify.register(auth, { prefix: "/auth" });

try {
  await fastify.listen({ port: fastify.config.PORT });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
