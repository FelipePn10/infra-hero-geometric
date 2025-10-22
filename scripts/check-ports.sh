#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_color() {
    echo -e "${2}${1}${NC}"
}

PORTS=(
    80      # Nginx HTTP
    443     # Nginx HTTPS
    3000    # Frontend
    8080    # Backend API
    5000    # Dashboard
    7000    # Visual Builder
    3001    # Grafana
    9090    # Prometheus
    9093    # Alertmanager
    8081    # Adminer (Database GUI)
    8082    # Redis Insight
    6001    # AI Assistant
    3306    # MySQL
    6379    # Redis
)

check_port_linux() {
    local port=$1
    if netstat -tuln 2>/dev/null | grep ":$port " > /dev/null; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Função para verificar porta no macOS
check_port_macos() {
    local port=$1
    if lsof -i :$port 2>/dev/null | grep LISTEN > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para verificar porta no Windows (WSL)
check_port_windows() {
    local port=$1
    if netstat -an 2>/dev/null | grep ":$port " | grep LISTEN > /dev/null; then
        return 0
    else
        return 1
    fi
}

case "$OSTYPE" in
    linux-gnu*)
        CHECK_FUNC="check_port_linux"
        ;;
    darwin*)
        CHECK_FUNC="check_port_macos"
        ;;
    msys*|cygwin*)
        CHECK_FUNC="check_port_windows"
        ;;
    *)
        print_color "❌ Sistema operacional não suportado: $OSTYPE" "$RED"
        exit 1
        ;;
esac

print_color "🔍 Verificando disponibilidade de portas..." "$BLUE"
echo ""

CONFLICTS=()
WARNINGS=()

for port in "${PORTS[@]}"; do
    if $CHECK_FUNC $port; then
        # Tentar identificar qual processo está usando a porta
        local process=""
        case "$OSTYPE" in
            linux-gnu*)
                process=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f2)
                ;;
            darwin*)
                process=$(lsof -i :$port 2>/dev/null | grep LISTEN | awk '{print $1}')
                ;;
            msys*|cygwin*)
                process=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTEN | awk '{print $5}')
                ;;
        esac

        CONFLICTS+=("$port ($process)")
        print_color "❌ Porta $port está em uso por: $process" "$RED"
    else
        print_color "✅ Porta $port está disponível" "$GREEN"
    fi
done

echo ""

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    print_color "⚠️  Conflitos de porta detectados:" "$YELLOW"
    for conflict in "${CONFLICTS[@]}"; do
        print_color "   - $conflict" "$YELLOW"
    done
    echo ""

    print_color "💡 Soluções possíveis:" "$BLUE"
    print_color "   1. Pare os serviços conflitantes" "$CYAN"
    print_color "   2. Altere as portas no arquivo .env" "$CYAN"
    print_color "   3. Use 'make down' para parar containers Hero Infra existentes" "$CYAN"
    echo ""

    read -p "Deseja continuar mesmo com conflitos? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_color "❌ Setup interrompido devido a conflitos de porta" "$RED"
        exit 1
    else
        print_color "⚠️  Continuando com conflitos de porta..." "$YELLOW"
    fi
else
    print_color "🎉 Todas as portas estão disponíveis!" "$GREEN"
fi

# Verificar portas baixas que podem precisar de sudo
LOW_PORTS=(80 443)
for port in "${LOW_PORTS[@]}"; do
    if [ $port -lt 1024 ]; then
        if [ "$EUID" -ne 0 ]; then
            print_color "ℹ️  Porta $port é privilegiada - pode precisar de sudo para o Nginx" "$YELLOW"
        fi
    fi
done

echo ""
print_color "✅ Verificação de portas concluída" "$GREEN"
