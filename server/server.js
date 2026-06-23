import Fastify from "fastify";
import envPlugin from "./src/plugins/env.js";
import corsPlugin from "./src/plugins/cors.js";
import dbPlugin from "./src/plugins/db.js";
import jwtPlugin from "./src/plugins/jwt.js";
import auth from "./routes/auth.js";
import customers from "./routes/customers.js";
import plans from "./routes/plans.js";
import internetPayments from "./routes/internetPayments.js";
import cablePayments from "./routes/cablePayments.js";
import { startPaymentCron } from "./src/cron/generatePayments.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(envPlugin);
await fastify.register(corsPlugin);
await fastify.register(dbPlugin);
await fastify.register(jwtPlugin);
await fastify.register(auth, { prefix: "/auth" });
await fastify.register(customers, { prefix: "/customers" });
await fastify.register(plans, { prefix: "/plans" });
await fastify.register(internetPayments, { prefix: "/internet-payments" });
await fastify.register(cablePayments, { prefix: "/cable-payments" });

try {
  await fastify.listen({ port: fastify.config.PORT, host: fastify.config.HOST });
  startPaymentCron(fastify);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
