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
