.PHONY: up down logs ps build install dev start db-migrate seed-admin docker-db-migrate docker-seed-admin

# --- Docker (postgres + server + client) ---
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

docker-db-migrate:
	docker compose exec server pnpm db:migrate

docker-seed-admin:
	docker compose exec server pnpm seed:admin $(EMAIL) $(PASSWORD)

# --- Local dev (without Docker, requires `make up` for postgres) ---
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
