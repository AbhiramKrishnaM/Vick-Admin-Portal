import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";

export default fp(async function jwtPlugin(fastify) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  });

  fastify.decorate("requireRole", function (role) {
    return async function (request, reply) {
      await fastify.authenticate(request, reply);
      if (reply.sent) return;

      if (request.user.role !== role) {
        reply.code(403).send({ error: "Forbidden" });
      }
    };
  });
});
