#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_color() {
    echo -e "${2}${1}${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_color "╔════════════════════════════════════════════════════════════╗" "${BLUE}"
print_color "║                HERO INFRA - SETUP SCRIPT                  ║" "${BLUE}"
print_color "╚════════════════════════════════════════════════════════════╝" "${BLUE}"
echo ""

if [[ "$OSTYPE" != "linux-gnu"* ]] && [[ "$OSTYPE" != "darwin"* ]]; then
    print_color "❌ Este script só suporta Linux e macOS" "${RED}"
    exit 1
fi

print_color "🔍 Verificando pré-requisitos..." "${BLUE}"

if ! command_exists docker; then
    print_color "❌ Docker não encontrado. Instalando..." "${RED}"

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        sudo usermod -aG docker $USER
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_color "📦 Por favor, instale o Docker Desktop manualmente:" "${YELLOW}"
        print_color "   https://docs.docker.com/desktop/install/mac-install/" "${YELLOW}"
        exit 1
    fi
else
    print_color "✅ Docker encontrado" "${GREEN}"
fi

if ! command_exists docker-compose && ! docker compose version &>/dev/null; then
    print_color "❌ Docker Compose não encontrado. Instalando..." "${RED}"

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_color "📦 Docker Compose deve vir com Docker Desktop" "${YELLOW}"
    fi
else
    print_color "✅ Docker Compose encontrado" "${GREEN}"
fi

print_color "📁 Criando estrutura de diretórios..." "${BLUE}"

mkdir -p {logs,data,backups,scripts,config}
mkdir -p logs/{frontend,backend,nginx,mysql,redis,monitoring}
mkdir -p data/{mysql,redis,grafana,prometheus,backups}
mkdir -p backups/{database,snapshots,configs}
mkdir -p config/{nginx,ssl,monitoring}

print_color "✅ Estrutura de diretórios criada" "${GREEN}"

if [ ! -f .env ]; then
    print_color "📄 Criando arquivo .env..." "${BLUE}"

    cat > .env << EOF
# Hero Infra Environment Configuration
# ====================================

# Application Settings
APP_NAME=HeroInfra
APP_VERSION=2.1.0
APP_ENV=development
APP_DEBUG=true

# Database Configuration
MYSQL_ROOT_PASSWORD=hero_root_2024
MYSQL_DATABASE=hero_infra
MYSQL_USER=hero_user
MYSQL_PASSWORD=hero_pass_2024
MYSQL_HOST=mysql
MYSQL_PORT=3306

# Redis Configuration
REDIS_PASSWORD=redis_hero_2024
REDIS_HOST=redis
REDIS_PORT=6379

# Backend API Configuration
BACKEND_PORT=8080
BACKEND_HOST=0.0.0.0
BACKEND_URL=http://localhost:8080
JWT_SECRET=hero_jwt_secret_2024_change_in_production
API_RATE_LIMIT=1000

# Frontend Configuration
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Dashboard Configuration
DASHBOARD_PORT=5000
VISUAL_BUILDER_PORT=7000
AI_ASSISTANT_PORT=6001

# Monitoring Configuration
GRAFANA_PORT=3001
PROMETHEUS_PORT=9090
ALERTMANAGER_PORT=9093

# Database GUI
ADMINER_PORT=8081
REDIS_INSIGHT_PORT=8082

# Nginx Configuration
NGINX_PORT=80
NGINX_SSL_PORT=443
SSL_CERT=./config/ssl/cert.pem
SSL_KEY=./config/ssl/key.pem

# Development Features
HOT_RELOAD=true
AUTO_MIGRATIONS=true
DEBUG_TOOLS=true

# Security
ENCRYPTION_KEY=hero_encryption_key_2024_change_in_production
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Backup Configuration
BACKUP_RETENTION_DAYS=7
AUTO_BACKUP=true

EOF

    print_color "✅ Arquivo .env criado" "${GREEN}"
    print_color "⚠️  Revise as configurações no arquivo .env antes de prosseguir" "${YELLOW}"
else
    print_color "✅ Arquivo .env já existe" "${GREEN}"
fi

# Criar certificados SSL autoassinados para desenvolvimento
print_color "🔐 Criando certificados SSL para desenvolvimento..." "${BLUE}"

mkdir -p config/ssl
if [ ! -f config/ssl/cert.pem ] || [ ! -f config/ssl/key.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout config/ssl/key.pem \
        -out config/ssl/cert.pem \
        -subj "/C=BR/ST=Sao_Paulo/L=Sao_Paulo/O=HeroInfra/OU=Development/CN=localhost" 2>/dev/null

    if [ $? -eq 0 ]; then
        print_color "✅ Certificados SSL criados" "${GREEN}"
    else
        print_color "⚠️  Não foi possível criar certificados SSL (openssl não encontrado)" "${YELLOW}"
        print_color "   Certificados serão gerados automaticamente pelo Nginx" "${YELLOW}"
    fi
else
    print_color "✅ Certificados SSL já existem" "${GREEN}"
fi

print_color "🔒 Configurando permissões..." "${BLUE}"

chmod +x scripts/*.sh
chmod 755 logs/ data/ backups/

# Criar script de health check
print_color "🏥 Criando script de health check..." "${BLUE}"

cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for Hero Infra
set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verificando saúde dos serviços..."

check_service() {
    local name=$1
    local url=$2
    local expected=$3

    if curl -s -f "$url" > /dev/null; then
        echo -e "✅ ${GREEN}$name está respondendo${NC}"
        return 0
    else
        echo -e "❌ ${RED}$name não está respondendo${NC}"
        return 1
    fi
}

# Verificar serviços principais
check_service "Frontend" "http://localhost:3000" "200"
check_service "Backend API" "http://localhost:8080/health" "200"
check_service "Nginx" "http://localhost" "200"
check_service "Dashboard" "http://localhost:5000" "200"

# Verificar banco de dados
if docker ps | grep hero-mysql > /dev/null; then
    echo -e "✅ ${GREEN}MySQL está rodando${NC}"
else
    echo -e "❌ ${RED}MySQL não está rodando${NC}"
fi

# Verificar Redis
if docker ps | grep hero-redis > /dev/null; then
    echo -e "✅ ${GREEN}Redis está rodando${NC}"
else
    echo -e "❌ ${RED}Redis não está rodando${NC}"
fi

# Verificar monitoramento
check_service "Grafana" "http://localhost:3001" "200"
check_service "Prometheus" "http://localhost:9090" "200"

echo ""
echo -e "${GREEN}✅ Verificação de saúde concluída${NC}"
EOF

chmod +x scripts/health-check.sh

# Criar script de backup
print_color "💾 Criando script de backup..." "${BLUE}"

cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup script for Hero Infra
set -e

BACKUP_DIR="./backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "💾 Criando backup do banco de dados..."

# Carregar variáveis do .env
set -a
source .env
set +a

docker exec hero-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup criado: $BACKUP_FILE"

    # Limpar backups antigos (manter apenas últimos 7 dias)
    find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
    echo "🗑️  Backups antigos removidos"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi
EOF

chmod +x scripts/backup.sh

# Criar script de restore
print_color "📥 Criando script de restore..." "${BLUE}"

cat > scripts/restore.sh << 'EOF'
#!/bin/bash

# Restore script for Hero Infra
set -e

BACKUP_DIR="./backups/database"

if [ -z "$1" ]; then
    echo "📂 Backups disponíveis:"
    ls -1 $BACKUP_DIR/*.sql 2>/dev/null | xargs -n 1 basename || echo "Nenhum backup encontrado"
    echo ""
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "📥 Restaurando backup: $BACKUP_FILE"

# Carregar variáveis do .env
set -a
source .env
set +a

docker exec -i hero-mysql mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado com sucesso"
else
    echo "❌ Erro ao restaurar backup"
    exit 1
fi
EOF

chmod +x scripts/restore.sh

# Criar script de start
print_color "🚀 Criando script de inicialização..." "${BLUE}"

cat > scripts/start.sh << 'EOF'
#!/bin/bash

# Start script for Hero Infra
set -e

echo "🚀 Iniciando Hero Infra..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker Desktop primeiro."
    exit 1
fi

# Verificar portas
./scripts/check-ports.sh

# Carregar variáveis do .env
set -a
source .env
set +a

echo "✅ Ambiente carregado"
echo "📦 Iniciando containers..."
EOF

chmod +x scripts/start.sh

# Finalização
print_color "" "${NC}"
print_color "╔════════════════════════════════════════════════════════════╗" "${GREEN}"
print_color "║                   SETUP CONCLUÍDO! 🎉                    ║" "${GREEN}"
print_color "╚════════════════════════════════════════════════════════════╝" "${GREEN}"
print_color "" "${NC}"
print_color "📝 Próximos passos:" "${BLUE}"
print_color "  1. Revise o arquivo .env e ajuste as configurações se necessário" "${YELLOW}"
print_color "  2. Execute 'make dev' para iniciar o ambiente de desenvolvimento" "${YELLOW}"
print_color "  3. Execute 'make all' para iniciar todos os serviços (dev + monitoring)" "${YELLOW}"
print_color "" "${NC}"
print_color "🌐 URLs de acesso:" "${BLUE}"
print_color "  Frontend:       http://localhost:3000" "${CYAN}"
print_color "  Backend:        http://localhost:8080" "${CYAN}"
print_color "  Dashboard:      http://localhost:5000" "${CYAN}"
print_color "  Visual Builder: http://localhost:7000" "${CYAN}"
print_color "  Grafana:        http://localhost:3001" "${CYAN}"
print_color "" "${NC}"
print_color "🔧 Comandos úteis:" "${BLUE}"
print_color "  make status     - Ver status dos containers" "${CYAN}"
print_color "  make logs       - Ver logs dos serviços" "${CYAN}"
print_color "  make health     - Verificar saúde dos serviços" "${CYAN}"
print_color "  make clean      - Limpar ambiente" "${CYAN}"
print_color "" "${NC}"
