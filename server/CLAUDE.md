# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a new, minimal Fastify server scaffold. The entire server currently lives in `server.js`. There is no test suite, build step, linter, or routing/module structure set up yet — these will need to be established as the project grows.

## Commands

- Install dependencies: `pnpm install` (this project uses pnpm, pinned via `packageManager: pnpm@10.22.0` in package.json)
- Run the server: `node server.js` (starts Fastify on port 3000, with logging enabled)
- `pnpm test` is a placeholder and currently exits with an error — there is no test runner configured.

## Architecture

- `server.js` is the entry point. It creates a Fastify instance with logging enabled and registers routes directly (currently a single `GET /` route).
- The repo root (one level up, `Vicky/`) also contains an empty `client/` directory and a `docker-compose.yml`, suggesting a planned client/server split with containerized deployment — neither is implemented yet.



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
