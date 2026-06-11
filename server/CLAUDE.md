# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

A Fastify server with JWT auth and a Postgres-backed customer (CRM) API. There is no test suite, build step, or linter set up yet.

## Commands

All commands can be run from the repo root via `make` (see `Makefile`), or from `server/`/`client/` via `pnpm`:

### Docker (postgres + server + client, full stack)

- `make up` / `make down` — start/stop the whole stack via docker compose (postgres on host port 5433, server on 3000, client on 5173; source dirs are bind-mounted so both apps hot-reload)
- `make build` — rebuild images after dependency changes
- `make docker-db-migrate` — apply pending SQL migrations inside the `server` container
- `make docker-seed-admin EMAIL=... PASSWORD=...` — create/update the initial admin user inside the `server` container

### Local dev (without Docker; `make up` still needed for postgres)

- `make install` — `pnpm install` in `server/`
- `make db-migrate` — apply any pending SQL migrations in `server/db/migrations/`
- `make seed-admin EMAIL=... PASSWORD=...` — create/update the initial admin user
- `make dev` — run the server with `node --watch` (auto-restart)
- `make start` — run the server normally
- `pnpm test` is a placeholder and currently exits with an error — there is no test runner configured.

Server config comes from `server/.env` (see `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `PORT`, `HOST` (must be `0.0.0.0` in Docker so the published port is reachable). Client config comes from `client/.env`: `VITE_API_URL`.

## Architecture

- `server.js` is the entry point. It registers plugins (`src/plugins/`) then route modules (`routes/`), each under a path prefix.
- `src/plugins/env.js` — loads/validates env vars via `@fastify/env`, exposes `fastify.config`.
- `src/plugins/db.js` — registers `@fastify/postgres`, exposes `fastify.pg`.
- `src/plugins/jwt.js` — registers `@fastify/jwt` and decorates `fastify.authenticate` (verifies JWT) and `fastify.requireRole(role)` (auth + role check), used as route `preHandler`s.
- `src/constants/` — shared enums referenced by both DB CHECK constraints and route validation schemas: `roles.js` (user roles, currently only `admin`), `idProofTypes.js`, `connectionTypes.js`, `paymentMethods.js`.
- `src/services/` — DB access layer (raw SQL via `fastify.pg`), one file per resource (`auth.service.js`, `customer.service.js`).
- `routes/` — one Fastify plugin per resource (`auth.js`, `customers.js`), each following the Schema -> Implementation -> Registration layout described below.

### Database migrations

- `server/db/migrations/NNNN_description.sql` — sequential, numbered SQL migration files. Never edit an already-applied migration; add a new numbered file instead.
- `server/db/migrate.js` (`pnpm db:migrate`) — applies any `.sql` files not yet recorded in the `schema_migrations` table, in filename order, each wrapped in a transaction.
- `server/db/seed-admin.js` (`pnpm seed:admin <email> <password>`) — upserts an admin user; does not touch schema.

The repo root (one level up, `Vicky/`) contains `client/`, a Vite + React + TypeScript + shadcn/ui frontend (login + customers CRUD), and the root `docker-compose.yml` defining `postgres`, `server`, and `client` services.



## Fastify Code Style & Constraints
- **Asynchronous:** Always use `async/await`. No raw callbacks or `.then()` chains.
- **Validation:** Every route *must* have a strict validation schema (`body`, `querystring`, or `params`).
- **Line Counts:** Keep route handlers under 25 lines. Move complex logic to services.
- **Encapsulation:** Wrap route groups in standalone plugins using standard Fastify isolation.

## Code Review & Rule Compliance Protocol
Before you output any code or review a Pull Request, you must internally run this checklist. If your proposed code violates any point, you must refactor it before showing it to the user:
1. Is the route handler under 25 lines of code?
2. Did I explicitly include a validation schema object?
3. Am I using `async/await` for all asynchronous operations?
4. Does the code layout exactly match the [Schema] -> [Implementation] -> [Registration] pattern?
