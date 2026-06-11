.PHONY: up down logs ps install dev start seed-admin

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

seed-admin:
	cd server && pnpm seed:admin $(EMAIL) $(PASSWORD)
