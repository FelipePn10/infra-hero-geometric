#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ========================================
# CONFIGURAÇÕES
# ========================================
FRONTEND_REPO="${FRONTEND_REPO:-https://github.com/seu-usuario/frontend.git}"
BACKEND_REPO="${BACKEND_REPO:-https://github.com/seu-usuario/backend.git}"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BRANCH="${BRANCH:-main}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           HERO INFRA - Deploy Produção                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# 1. Verificações Iniciais
# ========================================
echo -e "${YELLOW}[1/8] Verificando requisitos...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não encontrado${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon não está rodando${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Requisitos OK${NC}"

# ========================================
# 2. Verificar Portas
# ========================================
echo -e "${YELLOW}[2/8] Verificando portas...${NC}"

if lsof -i :80 > /dev/null 2>&1; then
    echo -e "${RED}❌ Porta 80 em uso${NC}"
    echo -e "${YELLOW}Execute: sudo kill -9 \$(lsof -ti :80)${NC}"
    exit 1
fi

if lsof -i :443 > /dev/null 2>&1; then
    echo -e "${RED}❌ Porta 443 em uso${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Portas disponíveis${NC}"

# ========================================
# 3. Função para Clonar/Atualizar Repos
# ========================================
update_repository() {
    local repo_url=$1
    local dir_name=$2
    local branch=$3

    if [ -d "$dir_name/.git" ]; then
        echo -e "${BLUE}📥 Atualizando $dir_name...${NC}"
        cd "$dir_name"
        git fetch origin
        git checkout "$branch"
        git pull origin "$branch"
        cd ..
        echo -e "${GREEN}✅ $dir_name atualizado${NC}"
    else
        if [ -d "$dir_name" ]; then
            echo -e "${YELLOW}⚠️  $dir_name existe mas não é um repositório git${NC}"
            read -p "Deseja remover e clonar novamente? (s/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                rm -rf "$dir_name"
            else
                echo -e "${RED}❌ Deploy cancelado${NC}"
                exit 1
            fi
        fi

        echo -e "${BLUE}📥 Clonando $dir_name...${NC}"
        git clone -b "$branch" "$repo_url" "$dir_name"
        echo -e "${GREEN}✅ $dir_name clonado${NC}"
    fi
}

# ========================================
# 4. Atualizar Repositórios
# ========================================
echo -e "${YELLOW}[3/8] Atualizando repositórios...${NC}"

if [ "$FRONTEND_REPO" != "https://github.com/seu-usuario/frontend.git" ]; then
    update_repository "$FRONTEND_REPO" "$FRONTEND_DIR" "$BRANCH"
else
    echo -e "${YELLOW}⚠️  URL do frontend não configurada (use export FRONTEND_REPO=...)${NC}"
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ Diretório frontend não encontrado${NC}"
        exit 1
    fi
fi

if [ "$BACKEND_REPO" != "https://github.com/seu-usuario/backend.git" ]; then
    update_repository "$BACKEND_REPO" "$BACKEND_DIR" "$BRANCH"
else
    echo -e "${YELLOW}⚠️  URL do backend não configurada (use export BACKEND_REPO=...)${NC}"
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Diretório backend não encontrado${NC}"
        exit 1
    fi
fi

# ========================================
# 5. Criar Backups
# ========================================
echo -e "${YELLOW}[4/8] Criando backup do banco de dados...${NC}"

if docker ps | grep -q hero-mysql-prod; then
    mkdir -p backups
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker exec hero-mysql-prod mysqldump -uroot -p${MYSQL_ROOT_PASSWORD:-root} hero > "backups/pre_deploy_$TIMESTAMP.sql" 2>/dev/null || true

    if [ -f "backups/pre_deploy_$TIMESTAMP.sql" ]; then
        gzip "backups/pre_deploy_$TIMESTAMP.sql"
        echo -e "${GREEN}✅ Backup criado: backups/pre_deploy_$TIMESTAMP.sql.gz${NC}"
    else
        echo -e "${YELLOW}⚠️  Não foi possível criar backup (banco pode não estar rodando)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MySQL não está rodando, pulando backup${NC}"
fi

# ========================================
# 6. Verificar Arquivo .env
# ========================================
echo -e "${YELLOW}[5/8] Verificando configurações...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando...${NC}"
    cat > .env << EOF
NODE_ENV=production
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
DB_NAME=hero
DB_USER=hero_user
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
EOF
    echo -e "${GREEN}✅ Arquivo .env criado com senhas aleatórias${NC}"
    echo -e "${RED}⚠️  IMPORTANTE: Salve estas credenciais em local seguro!${NC}"
fi

# ========================================
# 7. Parar Containers Antigos
# ========================================
echo -e "${YELLOW}[6/8] Parando ambiente anterior...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Ambiente anterior parado${NC}"

# ========================================
# 8. Subir Novos Containers
# ========================================
echo -e "${YELLOW}[7/8] Iniciando novos containers...${NC}"

# Pull das imagens base primeiro
docker compose -f docker-compose.prod.yml pull 2>/dev/null || true

# Build e start
docker compose -f docker-compose.prod.yml up --build -d

echo -e "${GREEN}✅ Containers iniciados${NC}"

# ========================================
# 9. Verificar Health
# ========================================
echo -e "${YELLOW}[8/8] Verificando saúde dos serviços...${NC}"

sleep 5

check_health() {
    local service=$1
    local max_attempts=30
    local attempt=0

    echo -n "Aguardando $service... "

    while [ $attempt -lt $max_attempts ]; do
        if docker ps | grep -q "$service.*healthy\|Up"; then
            echo -e "${GREEN}✅${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
        echo -n "."
    done

    echo -e "${RED}❌${NC}"
    return 1
}

check_health "hero-mysql-prod"
check_health "hero-backend-prod"
check_health "hero-frontend-prod"
check_health "hero-nginx-prod"

# ========================================
# Finalização
# ========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deploy Concluído com Sucesso!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Status dos serviços:${NC}"
docker compose -f docker-compose.prod.yml ps
echo ""
echo -e "${BLUE}URLs disponíveis:${NC}"
echo -e "  ${GREEN}HTTP:${NC}  http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "  ${GREEN}HTTPS:${NC} https://$(hostname -I | awk '{print $1}')${NC}"
echo ""
echo -e "${BLUE}Comandos úteis:${NC}"
echo -e "  ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}  - Ver logs"
echo -e "  ${YELLOW}docker compose -f docker-compose.prod.yml ps${NC}       - Ver status"
echo -e "  ${YELLOW}docker compose -f docker-compose.prod.yml down${NC}     - Parar tudo"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos para produção:${NC}"
echo -e "  1. Configure certificados SSL em nginx/ssl/"
echo -e "  2. Atualize as URLs no nginx.prod.conf"
echo -e "  3. Configure firewall (UFW) para portas 80 e 443"
echo -e "  4. Configure backup automático do banco de dados"
echo ""
