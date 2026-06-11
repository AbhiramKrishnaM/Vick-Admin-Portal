import {
  findUserByEmail,
  verifyPassword,
} from "../src/services/auth.service.js";

// [Schema]
const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 1 },
    },
  },
};

// [Implementation]
async function login(request, reply) {
  const { email, password } = request.body;

  const user = await findUserByEmail(this, email);
  if (!user) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const token = this.jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return { token };
}

// [Registration]
async function authRoutes(fastify) {
  fastify.post("/login", { schema: loginSchema }, login);
}

export default authRoutes;
