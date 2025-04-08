up:
	@echo "🚀 Iniciando ambiente com validações..."
	@./scripts/start.sh

down:
	@echo "🧯 Finalizando containers..."
	@./scripts/stop.sh

logs:
	@echo "📜 Exibindo logs do frontend:"
	@tail -f logs/frontend.log
