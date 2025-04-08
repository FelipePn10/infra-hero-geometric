#!/bin/bash

# Verifica se a porta 80 está livre
if lsof -i:80 > /dev/null; then
  echo "❌ Porta 80 já está em uso. Libere antes de subir os containers."
  exit 1
fi

# Cria o diretório de logs, se não existir
mkdir -p logs

# Arquivo de log persistente
touch logs/frontend.log
