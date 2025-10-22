#!/bin/bash

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

check_service "Frontend" "http://localhost:3000" "200"
check_service "Backend API" "http://localhost:8080/health" "200"
check_service "Nginx" "http://localhost" "200"
check_service "Dashboard" "http://localhost:5000" "200"

if docker ps | grep hero-mysql > /dev/null; then
    echo -e "✅ ${GREEN}MySQL está rodando${NC}"
else
    echo -e "❌ ${RED}MySQL não está rodando${NC}"
fi

if docker ps | grep hero-redis > /dev/null; then
    echo -e "✅ ${GREEN}Redis está rodando${NC}"
else
    echo -e "❌ ${RED}Redis não está rodando${NC}"
fi

check_service "Grafana" "http://localhost:3001" "200"
check_service "Prometheus" "http://localhost:9090" "200"

echo ""
echo -e "${GREEN}✅ Verificação de saúde concluída${NC}"
