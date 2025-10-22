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
