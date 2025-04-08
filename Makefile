up:
	@echo "🚀 Iniciando ambiente..."
	./scripts/start.sh
	docker compose down
	docker compose up --build

down:
	@echo "🛑 Derrubando containers..."
	docker compose down

logs:
	docker compose logs -f

rebuild:
	docker compose build --no-cache
