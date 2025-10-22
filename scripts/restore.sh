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
