.PHONY: up down logs ps install dev start db-migrate seed-admin

# --- Docker (Postgres) ---
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

# --- Server ---
install:
	cd server && pnpm install

dev:
	cd server && pnpm dev

start:
	cd server && pnpm start

db-migrate:
	cd server && pnpm db:migrate

seed-admin:
	cd server && pnpm seed:admin $(EMAIL) $(PASSWORD)
