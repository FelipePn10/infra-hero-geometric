#!/bin/bash

set -e

# Configurações
FRONTEND_REPO="https://github.com/seu-usuario/frontend-hero-geometric.git"
BACKEND_REPO="https://github.com/seu-usuario/backend-hero-geometric.git"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
LOGS_DIR="logs"
FRONTEND_LOG="$LOGS_DIR/frontend.log"
BACKEND_LOG="$LOGS_DIR/backend.log"

# Verifica se a porta 80 está ocupada
if lsof -i :80 > /dev/null; then
  echo "⚠️  Porta 80 já está em uso. Finalize o processo antes de continuar."
  exit 1
fi

# Verifica se docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não está instalado. Instale antes de continuar."
    exit 1
fi

# Função para clonar ou atualizar repositórios
function update_repo() {
  local REPO_URL=$1
  local DIR_NAME=$2

  if [ -d "$DIR_NAME" ]; then
    echo "🔄 Atualizando $DIR_NAME..."
    cd "$DIR_NAME"
    git pull origin main || git pull origin master
    cd ..
  else
    echo "⬇️ Clonando $DIR_NAME..."
    git clone "$REPO_URL" "$DIR_NAME"
  fi
}

# Criar pastas e arquivos de log
mkdir -p "$LOGS_DIR"
touch "$FRONTEND_LOG" "$BACKEND_LOG"

# Atualiza repositórios
update_repo "$FRONTEND_REPO" "$FRONTEND_DIR"
update_repo "$BACKEND_REPO" "$BACKEND_DIR"

# Reinicia ambiente
echo "🧹 Limpando ambiente anterior..."
docker compose -f docker-compose.prod.yml down

# Sobe serviços
echo "🚀 Subindo serviços..."
docker compose -f docker-compose.prod.yml up --build -d

echo "✅ Ambiente iniciado com sucesso!"
