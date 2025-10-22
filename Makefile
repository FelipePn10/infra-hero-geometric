.PHONY: help setup up down restart rebuild logs clean dev prod staging monitoring status health backup restore test

DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_DEV = $(DOCKER_COMPOSE) -f docker-compose.yml
DOCKER_COMPOSE_STAGING = $(DOCKER_COMPOSE) -f docker-compose.staging.yml
DOCKER_COMPOSE_PROD = $(DOCKER_COMPOSE) -f docker-compose.prod.yml
DOCKER_COMPOSE_MONITORING = $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml

# Cores
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
NC = \033[0m

# Dashboard
DOCKER_COMPOSE_DASHBOARD = $(DOCKER_COMPOSE) -f docker-compose.dashboard.yml

help:
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║           HERO INFRA - Comandos Disponíveis               ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📦 Setup & Inicialização:$(NC)"
	@echo "  make setup          - Configuração inicial completa"
	@echo "  make dev            - Inicia ambiente de desenvolvimento"
	@echo "  make staging        - Inicia ambiente de staging"
	@echo "  make prod           - Inicia ambiente de produção"
	@echo "  make monitoring     - Inicia stack de monitoramento"
	@echo "  make all            - Inicia dev + monitoring"
	@echo ""
	@echo "$(GREEN)🚀 Gerenciamento:$(NC)"
	@echo "  make up             - Sobe todos os serviços (dev)"
	@echo "  make down           - Para todos os serviços"
	@echo "  make down-all       - Para TUDO (dev + staging + prod + monitoring)"
	@echo "  make restart        - Reinicia todos os serviços"
	@echo "  make rebuild        - Rebuilda e sobe os containers"
	@echo ""
	@echo "$(GREEN)📊 Monitoramento:$(NC)"
	@echo "  make logs           - Exibe logs de todos os serviços"
	@echo "  make logs-f         - Exibe logs em tempo real"
	@echo "  make status         - Status de todos os containers"
	@echo "  make health         - Verifica saúde dos serviços"
	@echo "  make metrics        - Abre Grafana no navegador"
	@echo "  make prometheus     - Abre Prometheus no navegador"
	@echo ""
	@echo "$(GREEN)🔧 Manutenção:$(NC)"
	@echo "  make clean          - Limpa containers, volumes e imagens"
	@echo "  make clean-logs     - Limpa arquivos de log"
	@echo "  make backup         - Backup do banco de dados"
	@echo "  make restore        - Restaura backup do banco"
	@echo "  make prune          - Remove recursos Docker não utilizados"
	@echo ""
	@echo "$(GREEN)🧪 Testes & CI:$(NC)"
	@echo "  make test           - Executa testes automatizados"
	@echo "  make test-integration - Testes de integração"
	@echo "  make validate       - Valida arquivos de configuração"
	@echo "  make security-scan  - Scan de segurança com Trivy"
	@echo ""
	@echo "$(GREEN)🐚 Shell & Debug:$(NC)"
	@echo "  make shell-frontend - Acessa shell do frontend"
	@echo "  make shell-backend  - Acessa shell do backend"
	@echo "  make shell-db       - Acessa shell do MySQL"
	@echo ""
	@echo "$(CYAN)📈 URLs de Acesso:$(NC)"
	@echo "  Frontend:    http://localhost:3000"
	@echo "  Backend:     http://localhost:8080"
	@echo "  Proxy:       http://localhost"
	@echo "  Grafana:     http://localhost:3001"
	@echo "  Prometheus:  http://localhost:9090"
	@echo ""
	@echo "$(CYAN)💻 Terminal:$(NC)"
	@echo "  http://localhost:5000/Terminal.tsx"


setup:
	@echo "$(BLUE)🚀 Iniciando configuração do ambiente...$(NC)"
	@chmod +x scripts/*.sh
	@./scripts/setup.sh
	@echo "$(GREEN)✅ Setup concluído!$(NC)"

dev: check-ports
	@echo "$(BLUE)🔨 Iniciando ambiente de desenvolvimento...$(NC)"
	@./scripts/start.sh
	@$(DOCKER_COMPOSE_DEV) up --build -d
	@echo "$(GREEN)✅ Ambiente dev iniciado!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8080$(NC)"
	@echo "$(YELLOW)Proxy: http://localhost$(NC)"

up: dev

staging: check-ports
	@echo "$(BLUE)🔨 Iniciando ambiente de staging...$(NC)"
	@$(DOCKER_COMPOSE_STAGING) up --build -d
	@echo "$(GREEN)✅ Ambiente staging iniciado!$(NC)"

prod: check-ports
	@echo "$(BLUE)🚀 Iniciando ambiente de produção...$(NC)"
	@./scripts/deploy.sh
	@$(DOCKER_COMPOSE_PROD) up --build -d
	@echo "$(GREEN)✅ Ambiente prod iniciado!$(NC)"

monitoring:
	@echo "$(PURPLE)📊 Iniciando stack de monitoramento...$(NC)"
	@$(DOCKER_COMPOSE_MONITORING) up -d
	@sleep 5
	@echo "$(GREEN)✅ Monitoring stack iniciado!$(NC)"
	@echo "$(CYAN)Grafana: http://localhost:3001 (admin/admin)$(NC)"
	@echo "$(CYAN)Prometheus: http://localhost:9090$(NC)"
	@echo "$(CYAN)Alertmanager: http://localhost:9093$(NC)"

dashboard:
	@echo "$(PURPLE)🎛️  Iniciando Web Dashboard...$(NC)"
	@$(DOCKER_COMPOSE_DASHBOARD) up -d
	@sleep 3
	@echo "$(GREEN)✅ Dashboard iniciado!$(NC)"
	@echo "$(CYAN)Dashboard: http://localhost:5000$(NC)"
	@echo "$(CYAN)Visual Builder: http://localhost:7000$(NC)"
	@echo "$(YELLOW)Features:$(NC)"
	@echo "  ✅ Real-time service monitoring"
	@echo "  ✅ One-click service installation"
	@echo "  ✅ Auto code sync & hot reload"
	@echo "  ✅ Automatic database migrations"
	@echo "  ✅ Visual docker-compose builder"

visual-builder:
	@echo "$(PURPLE)🎨 Abrindo Visual Builder...$(NC)"
	@open http://localhost:7000 2>/dev/null || xdg-open http://localhost:7000 2>/dev/null || echo "Acesse: http://localhost:7000"

all: dev monitoring dashboard
	@echo "$(GREEN)✅ Todos os serviços iniciados!$(NC)"
	@echo ""
	@echo "$(CYAN)╔════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║           Hero Infra is Ready! 🚀             ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Quick Access:$(NC)"
	@echo "  🌐 App:            http://localhost"
	@echo "  🎛️  Dashboard:      http://localhost:5000"
	@echo "  📊 Grafana:        http://localhost:3001"
	@echo "  🎨 Visual Builder: http://localhost:7000"
	@echo "  🗄️  Database GUI:   http://localhost:8081"
	@echo "  💻 Web Terminal:   http://localhost:5000/Terminal.tsx"
	@echo "  🔴 Redis GUI:      http://localhost:8082"
	@echo "  🤖 AI Assistant:   http://localhost:6001"

down:
	@echo "$(YELLOW)🛑 Parando serviços de desenvolvimento...$(NC)"
	@$(DOCKER_COMPOSE_DEV) down
	@echo "$(GREEN)✅ Serviços parados!$(NC)"

down-staging:
	@echo "$(YELLOW)🛑 Parando serviços de staging...$(NC)"
	@$(DOCKER_COMPOSE_STAGING) down
	@echo "$(GREEN)✅ Staging parado!$(NC)"

down-prod:
	@echo "$(YELLOW)🛑 Parando serviços de produção...$(NC)"
	@$(DOCKER_COMPOSE_PROD) down
	@echo "$(GREEN)✅ Produção parada!$(NC)"

down-monitoring:
	@echo "$(YELLOW)🛑 Parando stack de monitoramento...$(NC)"
	@$(DOCKER_COMPOSE_MONITORING) down
	@echo "$(GREEN)✅ Monitoring parado!$(NC)"

down-dashboard:
	@echo "$(YELLOW)🛑 Parando dashboard...$(NC)"
	@$(DOCKER_COMPOSE_DASHBOARD) down
	@echo "$(GREEN)✅ Dashboard parado!$(NC)"

down-all: down down-staging down-prod down-monitoring down-dashboard
	@echo "$(GREEN)✅ Todos os ambientes parados!$(NC)".PHONY: help setup up down restart rebuild logs clean dev prod staging monitoring status health backup restore test

DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_DEV = $(DOCKER_COMPOSE) -f docker-compose.yml
DOCKER_COMPOSE_STAGING = $(DOCKER_COMPOSE) -f docker-compose.staging.yml
DOCKER_COMPOSE_PROD = $(DOCKER_COMPOSE) -f docker-compose.prod.yml
DOCKER_COMPOSE_MONITORING = $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml

# Cores
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
NC = \033[0m

# Dashboard
DOCKER_COMPOSE_DASHBOARD = $(DOCKER_COMPOSE) -f docker-compose.dashboard.yml

help:
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║           HERO INFRA - Comandos Disponíveis               ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📦 Setup & Inicialização:$(NC)"
	@echo "  make setup          - Configuração inicial completa"
	@echo "  make dev            - Inicia ambiente de desenvolvimento"
	@echo "  make staging        - Inicia ambiente de staging"
	@echo "  make prod           - Inicia ambiente de produção"
	@echo "  make monitoring     - Inicia stack de monitoramento"
	@echo "  make dashboard      - Inicia Web Dashboard + Auto-Sync"
	@echo "  make all            - Inicia dev + monitoring + dashboard"
	@echo "  make visual-builder - Inicia Visual Builder (drag & drop)"
	@echo ""
	@echo "$(GREEN)🚀 Gerenciamento:$(NC)"
	@echo "  make up             - Sobe todos os serviços (dev)"
	@echo "  make down           - Para todos os serviços"
	@echo "  make down-all       - Para TUDO (dev + staging + prod + monitoring)"
	@echo "  make restart        - Reinicia todos os serviços"
	@echo "  make rebuild        - Rebuilda e sobe os containers"
	@echo ""
	@echo "$(GREEN)📊 Monitoramento:$(NC)"
	@echo "  make logs           - Exibe logs de todos os serviços"
	@echo "  make logs-f         - Exibe logs em tempo real"
	@echo "  make status         - Status de todos os containers"
	@echo "  make health         - Verifica saúde dos serviços"
	@echo "  make metrics        - Abre Grafana no navegador"
	@echo "  make prometheus     - Abre Prometheus no navegador"
	@echo ""
	@echo "$(GREEN)🔧 Manutenção:$(NC)"
	@echo "  make clean          - Limpa containers, volumes e imagens"
	@echo "  make clean-logs     - Limpa arquivos de log"
	@echo "  make backup         - Backup do banco de dados"
	@echo "  make restore        - Restaura backup do banco"
	@echo "  make prune          - Remove recursos Docker não utilizados"
	@echo "  make snapshot       - Cria snapshot completo do ambiente"
	@echo "  make clone          - Clona ambiente para outro dev"
	@echo ""
	@echo "$(GREEN)🧪 Testes & CI:$(NC)"
	@echo "  make test           - Executa testes automatizados"
	@echo "  make test-integration - Testes de integração"
	@echo "  make validate       - Valida arquivos de configuração"
	@echo "  make security-scan  - Scan de segurança com Trivy"
	@echo ""
	@echo "$(GREEN)🐚 Shell & Debug:$(NC)"
	@echo "  make shell-frontend - Acessa shell do frontend"
	@echo "  make shell-backend  - Acessa shell do backend"
	@echo "  make shell-db       - Acessa shell do MySQL"
	@echo ""
	@echo "$(CYAN)📈 URLs de Acesso:$(NC)"
	@echo "  Frontend:       http://localhost:3000"
	@echo "  Backend:        http://localhost:8080"
	@echo "  Proxy:          http://localhost"
	@echo "  Dashboard:      http://localhost:5000"
	@echo "  Visual Builder: http://localhost:7000"
	@echo "  Grafana:        http://localhost:3001"
	@echo "  Prometheus:     http://localhost:9090"
	@echo ""

setup:
	@echo "$(BLUE)🚀 Iniciando configuração do ambiente...$(NC)"
	@chmod +x scripts/*.sh
	@./scripts/setup.sh
	@echo "$(GREEN)✅ Setup concluído!$(NC)"

dev: check-ports
	@echo "$(BLUE)🔨 Iniciando ambiente de desenvolvimento...$(NC)"
	@./scripts/start.sh
	@$(DOCKER_COMPOSE_DEV) up --build -d
	@echo "$(GREEN)✅ Ambiente dev iniciado!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8080$(NC)"
	@echo "$(YELLOW)Proxy: http://localhost$(NC)"

up: dev

staging: check-ports
	@echo "$(BLUE)🔨 Iniciando ambiente de staging...$(NC)"
	@$(DOCKER_COMPOSE_STAGING) up --build -d
	@echo "$(GREEN)✅ Ambiente staging iniciado!$(NC)"

prod: check-ports
	@echo "$(BLUE)🚀 Iniciando ambiente de produção...$(NC)"
	@./scripts/deploy.sh
	@$(DOCKER_COMPOSE_PROD) up --build -d
	@echo "$(GREEN)✅ Ambiente prod iniciado!$(NC)"

monitoring:
	@echo "$(PURPLE)📊 Iniciando stack de monitoramento...$(NC)"
	@$(DOCKER_COMPOSE_MONITORING) up -d
	@sleep 5
	@echo "$(GREEN)✅ Monitoring stack iniciado!$(NC)"
	@echo "$(CYAN)Grafana: http://localhost:3001 (admin/admin)$(NC)"
	@echo "$(CYAN)Prometheus: http://localhost:9090$(NC)"
	@echo "$(CYAN)Alertmanager: http://localhost:9093$(NC)"

all: dev monitoring
	@echo "$(GREEN)✅ Todos os serviços iniciados!$(NC)"

down:
	@echo "$(YELLOW)🛑 Parando serviços de desenvolvimento...$(NC)"
	@$(DOCKER_COMPOSE_DEV) down
	@echo "$(GREEN)✅ Serviços parados!$(NC)"

down-staging:
	@echo "$(YELLOW)🛑 Parando serviços de staging...$(NC)"
	@$(DOCKER_COMPOSE_STAGING) down
	@echo "$(GREEN)✅ Staging parado!$(NC)"

down-prod:
	@echo "$(YELLOW)🛑 Parando serviços de produção...$(NC)"
	@$(DOCKER_COMPOSE_PROD) down
	@echo "$(GREEN)✅ Produção parada!$(NC)"

down-monitoring:
	@echo "$(YELLOW)🛑 Parando stack de monitoramento...$(NC)"
	@$(DOCKER_COMPOSE_MONITORING) down
	@echo "$(GREEN)✅ Monitoring parado!$(NC)"

down-all: down down-staging down-prod down-monitoring
	@echo "$(GREEN)✅ Todos os ambientes parados!$(NC)"

restart: down up

restart-monitoring: down-monitoring monitoring

rebuild:
	@echo "$(BLUE)🔄 Rebuilding containers...$(NC)"
	@$(DOCKER_COMPOSE_DEV) build --no-cache
	@$(DOCKER_COMPOSE_DEV) up -d
	@echo "$(GREEN)✅ Rebuild concluído!$(NC)"

rebuild-prod:
	@echo "$(BLUE)🔄 Rebuilding production containers...$(NC)"
	@$(DOCKER_COMPOSE_PROD) build --no-cache
	@echo "$(GREEN)✅ Rebuild prod concluído!$(NC)"

logs:
	@$(DOCKER_COMPOSE_DEV) logs --tail=100

logs-f:
	@$(DOCKER_COMPOSE_DEV) logs -f

logs-frontend:
	@$(DOCKER_COMPOSE_DEV) logs -f frontend

logs-backend:
	@$(DOCKER_COMPOSE_DEV) logs -f backend

logs-nginx:
	@$(DOCKER_COMPOSE_DEV) logs -f nginx

logs-db:
	@$(DOCKER_COMPOSE_DEV) logs -f mysql

logs-monitoring:
	@$(DOCKER_COMPOSE_MONITORING) logs -f

status:
	@echo "$(BLUE)📊 Status dos Containers:$(NC)"
	@echo ""
	@echo "$(CYAN)Development:$(NC)"
	@$(DOCKER_COMPOSE_DEV) ps || true
	@echo ""
	@echo "$(CYAN)Monitoring:$(NC)"
	@$(DOCKER_COMPOSE_MONITORING) ps || true

health:
	@echo "$(BLUE)🏥 Verificando saúde dos serviços...$(NC)"
	@./scripts/health-check.sh

metrics:
	@echo "$(PURPLE)📊 Abrindo Grafana...$(NC)"
	@open http://localhost:3001 2>/dev/null || xdg-open http://localhost:3001 2>/dev/null || echo "Acesse: http://localhost:3001"

prometheus:
	@echo "$(PURPLE)📊 Abrindo Prometheus...$(NC)"
	@open http://localhost:9090 2>/dev/null || xdg-open http://localhost:9090 2>/dev/null || echo "Acesse: http://localhost:9090"

clean: down-all
	@echo "$(RED)🧹 Limpando containers, volumes e imagens...$(NC)"
	@docker system prune -af --volumes
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

clean-logs:
	@echo "$(YELLOW)🗑️  Limpando logs...$(NC)"
	@rm -rf logs/*
	@mkdir -p logs/frontend logs/backend logs/nginx logs/mysql
	@echo "$(GREEN)✅ Logs limpos!$(NC)"

prune:
	@echo "$(YELLOW)🗑️  Removendo recursos não utilizados...$(NC)"
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)✅ Prune concluído!$(NC)"

backup:
	@echo "$(BLUE)💾 Criando backup do banco de dados...$(NC)"
	@./scripts/backup.sh
	@echo "$(GREEN)✅ Backup criado!$(NC)"

restore:
	@echo "$(BLUE)📥 Restaurando backup do banco de dados...$(NC)"
	@./scripts/restore.sh
	@echo "$(GREEN)✅ Backup restaurado!$(NC)"

snapshot:
	@echo "$(BLUE)📸 Criando snapshot do ambiente...$(NC)"
	@read -p "Nome do snapshot: " name; \
	read -p "Descrição: " desc; \
	curl -X POST http://localhost:5000/api/snapshot \
		-H "Content-Type: application/json" \
		-d "{\"name\":\"$name\",\"description\":\"$desc\"}" | jq
	@echo "$(GREEN)✅ Snapshot criado!$(NC)"

list-snapshots:
	@echo "$(BLUE)📋 Listando snapshots...$(NC)"
	@curl -s http://localhost:5000/api/snapshots | jq

restore-snapshot:
	@echo "$(BLUE)📥 Restaurando snapshot...$(NC)"
	@read -p "Nome do snapshot: " name; \
	curl -X POST http://localhost:5000/api/snapshot/$name/restore | jq
	@echo "$(GREEN)✅ Snapshot restaurado!$(NC)"

clone:
	@echo "$(BLUE)👥 Clonando ambiente para compartilhar...$(NC)"
	@make snapshot
	@echo "$(YELLOW)Enviando para outro desenvolvedor...$(NC)"
	@echo "$(GREEN)✅ Use 'make restore-snapshot' no outro ambiente$(NC)"

test:
	@echo "$(BLUE)🧪 Executando testes...$(NC)"
	@./scripts/run-tests.sh

test-integration:
	@echo "$(BLUE)🧪 Executando testes de integração...$(NC)"
	@./scripts/integration-tests.sh

validate:
	@echo "$(BLUE)✅ Validando configurações...$(NC)"
	@$(DOCKER_COMPOSE_DEV) config > /dev/null && echo "$(GREEN)✅ docker-compose.yml válido$(NC)"
	@$(DOCKER_COMPOSE_PROD) config > /dev/null && echo "$(GREEN)✅ docker-compose.prod.yml válido$(NC)"
	@$(DOCKER_COMPOSE_STAGING) config > /dev/null && echo "$(GREEN)✅ docker-compose.staging.yml válido$(NC)"
	@$(DOCKER_COMPOSE_MONITORING) config > /dev/null && echo "$(GREEN)✅ docker-compose.monitoring.yml válido$(NC)"
	@docker run --rm -v $(PWD)/nginx:/etc/nginx:ro nginx:alpine nginx -t && echo "$(GREEN)✅ Nginx configs válidos$(NC)"

security-scan:
	@echo "$(BLUE)🔒 Executando scan de segurança...$(NC)"
	@docker run --rm -v $(PWD):/src aquasec/trivy:latest config /src
	@echo "$(GREEN)✅ Security scan concluído!$(NC)"

shell-frontend:
	@docker exec -it hero-frontend sh

shell-backend:
	@docker exec -it hero-backend sh

shell-db:
	@docker exec -it hero-mysql mysql -uroot -p$$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)

shell-nginx:
	@docker exec -it hero-nginx sh

shell-redis:
	@docker exec -it hero-redis redis-cli -a $$(grep REDIS_PASSWORD .env | cut -d '=' -f2)


check-ports:
	@./scripts/check-ports.sh

ps:
	@$(DOCKER_COMPOSE_DEV) ps

top:
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

inspect:
	@echo "$(BLUE)🔍 Inspecionando recursos...$(NC)"
	@echo ""
	@echo "$(CYAN)Containers:$(NC)"
	@docker ps -a --filter "name=hero-"
	@echo ""
	@echo "$(CYAN)Volumes:$(NC)"
	@docker volume ls --filter "name=hero"
	@echo ""
	@echo "$(CYAN)Networks:$(NC)"
	@docker network ls --filter "name=hero"

ci-test:
	@echo "$(BLUE)🔄 Executando pipeline CI...$(NC)"
	@make validate
	@make security-scan
	@make test

deploy-staging:
	@echo "$(BLUE)🚀 Deploy para staging...$(NC)"
	@./scripts/deploy-staging.sh

deploy-production:
	@echo "$(BLUE)🚀 Deploy para produção...$(NC)"
	@./scripts/deploy-production.sh

.DEFAULT_GOAL := help
