#!/bin/bash
set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           HERO INFRA - Setup Inicial                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# 1. Verificar Docker e Docker Compose
# ========================================
echo -e "${YELLOW}[1/8] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon não está rodando. Inicie o Docker primeiro.${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado. Por favor, instale o Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"

# ========================================
# 2. Criar estrutura de diretórios
# ========================================
echo -e "${YELLOW}[2/8] Criando estrutura de diretórios...${NC}"

DIRS=(
    "logs/frontend"
    "logs/backend"
    "logs/nginx"
    "logs/mysql"
    "nginx/ssl"
    "mysql/init"
    "backups"
    "scripts"
)

for dir in "${DIRS[@]}"; do
    mkdir -p "$dir"
    echo "  ✓ Criado: $dir"
done

echo -e "${GREEN}✅ Estrutura de diretórios criada${NC}"

# ========================================
# 3. Criar arquivos de log
# ========================================
echo -e "${YELLOW}[3/8] Criando arquivos de log...${NC}"

touch logs/frontend/app.log
touch logs/backend/app.log
touch logs/nginx/access.log
touch logs/nginx/error.log

echo -e "${GREEN}✅ Arquivos de log criados${NC}"

# ========================================
# 4. Criar arquivo .env se não existir
# ========================================
echo -e "${YELLOW}[4/8] Configurando variáveis de ambiente...${NC}"

if [ ! -f .env ]; then
    cat > .env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=root_password_change_me
DB_PASSWORD=hero_pass_change_me
DB_NAME=hero
DB_USER=hero_user

# Redis Configuration
REDIS_PASSWORD=redis_pass_change_me

# Application
NODE_ENV=development
PORT=3000
BACKEND_PORT=8080

# Security (Generate new secrets for production!)
JWT_SECRET=your_jwt_secret_here_change_me
API_KEY=your_api_key_here_change_me

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
EOF
    echo -e "${GREEN}✅ Arquivo .env criado (IMPORTANTE: Configure as senhas!)${NC}"
else
    echo -e "${BLUE}ℹ️  Arquivo .env já existe${NC}"
fi

# ========================================
# 5. Verificar repositórios frontend/backend
# ========================================
echo -e "${YELLOW}[5/8] Verificando repositórios...${NC}"

MISSING_REPOS=()

if [ ! -d "frontend" ]; then
    MISSING_REPOS+=("frontend")
    echo -e "${YELLOW}⚠️  Diretório frontend não encontrado${NC}"
fi

if [ ! -d "backend" ]; then
    MISSING_REPOS+=("backend")
    echo -e "${YELLOW}⚠️  Diretório backend não encontrado${NC}"
fi

if [ ${#MISSING_REPOS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ATENÇÃO: Repositórios ausentes                           ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Para adicionar os repositórios, você pode:"
    echo ""
    echo -e "${BLUE}Opção 1 - Clonar repositórios existentes:${NC}"
    echo "  git clone <url-frontend> frontend"
    echo "  git clone <url-backend> backend"
    echo ""
    echo -e "${BLUE}Opção 2 - Criar links simbólicos:${NC}"
    echo "  ln -s /caminho/para/seu/frontend frontend"
    echo "  ln -s /caminho/para/seu/backend backend"
    echo ""
    echo -e "${BLUE}Opção 3 - Copiar diretórios existentes:${NC}"
    echo "  cp -r /caminho/para/seu/frontend ."
    echo "  cp -r /caminho/para/seu/backend ."
    echo ""
else
    echo -e "${GREEN}✅ Repositórios frontend e backend encontrados${NC}"
fi

# ========================================
# 6. Verificar Dockerfiles
# ========================================
echo -e "${YELLOW}[6/8] Verificando Dockerfiles...${NC}"

create_dockerfiles() {
    # Dockerfile.dev para Frontend (React/Next.js)
    if [ ! -f "frontend/Dockerfile.dev" ]; then
        cat > frontend/Dockerfile.dev << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
EOF
        echo "  ✓ Criado: frontend/Dockerfile.dev"
    fi

    # Dockerfile.prod para Frontend
    if [ ! -f "frontend/Dockerfile.prod" ]; then
        cat > frontend/Dockerfile.prod << 'EOF'
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
EOF
        echo "  ✓ Criado: frontend/Dockerfile.prod"
    fi

    # Dockerfile.dev para Backend (Go)
    if [ ! -f "backend/Dockerfile.dev" ]; then
        cat > backend/Dockerfile.dev << 'EOF'
FROM golang:1.23-alpine

WORKDIR /app

# Install air for hot reload
RUN go install github.com/air-verse/air@latest

# Copy go mod files
COPY go.* ./
RUN go mod download

# Copy source code
COPY . .

EXPOSE 8080

# Use air for hot reload
CMD ["air", "-c", ".air.toml"]
EOF
        echo "  ✓ Criado: backend/Dockerfile.dev"
    fi

    # Dockerfile.prod para Backend (Go)
    if [ ! -f "backend/Dockerfile.prod" ]; then
        cat > backend/Dockerfile.prod << 'EOF'
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
EOF
        echo "  ✓ Criado: backend/Dockerfile.prod"
    fi

    # Arquivo .air.toml para hot reload do Go
    if [ ! -f "backend/.air.toml" ]; then
        cat > backend/.air.toml << 'EOF'
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ."
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  include_file = []
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_error = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = false

[screen]
  clear_on_rebuild = false
  keep_scroll = true
EOF
        echo "  ✓ Criado: backend/.air.toml"
    fi
}

if [ -d "frontend" ] && [ -d "backend" ]; then
    create_dockerfiles
    echo -e "${GREEN}✅ Dockerfiles verificados/criados${NC}"
else
    echo -e "${YELLOW}⚠️  Pulando criação de Dockerfiles (repositórios ausentes)${NC}"
fi

# ========================================
# 7. Criar script de health check
# ========================================
echo -e "${YELLOW}[7/8] Criando scripts auxiliares...${NC}"

cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local name=$1
    local url=$2

    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name está saudável${NC}"
        return 0
    else
        echo -e "${RED}❌ $name não está respondendo${NC}"
        return 1
    fi
}

echo "Verificando saúde dos serviços..."
echo ""

check_service "Frontend" "http://localhost:3000"
check_service "Backend" "http://localhost:8080/health"
check_service "Nginx" "http://localhost/health"

echo ""
echo "Verificando containers Docker..."
docker ps --filter "name=hero-" --format "table {{.Names}}\t{{.Status}}"
EOF

chmod +x scripts/health-check.sh

# ========================================
# 8. Criar scripts de backup/restore
# ========================================

cat > scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Criando backup do banco de dados..."
docker exec hero-mysql mysqldump -uroot -proot hero > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    gzip "$BACKUP_FILE"
    echo "✅ Backup criado: ${BACKUP_FILE}.gz"

    # Manter apenas os 5 backups mais recentes
    ls -t "$BACKUP_DIR"/backup_*.sql.gz | tail -n +6 | xargs -r rm
    echo "✅ Backups antigos removidos (mantidos os 5 mais recentes)"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi
EOF

chmod +x scripts/backup.sh

cat > scripts/restore.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups"

# Lista os backups disponíveis
echo "Backups disponíveis:"
ls -1 "$BACKUP_DIR"/backup_*.sql.gz | nl

# Solicita qual backup restaurar
read -p "Digite o número do backup para restaurar: " backup_num

# Obtém o arquivo selecionado
backup_file=$(ls -1 "$BACKUP_DIR"/backup_*.sql.gz | sed -n "${backup_num}p")

if [ -z "$backup_file" ]; then
    echo "❌ Backup inválido"
    exit 1
fi

echo "Restaurando backup: $backup_file"

# Descompacta temporariamente
gunzip -c "$backup_file" | docker exec -i hero-mysql mysql -uroot -proot hero

if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado com sucesso"
else
    echo "❌ Erro ao restaurar backup"
    exit 1
fi
EOF

chmod +x scripts/restore.sh

echo -e "${GREEN}✅ Scripts auxiliares criados${NC}"

# ========================================
# Finalização
# ========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Setup Concluído com Sucesso!                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo ""
echo -e "1. ${YELLOW}Configure o arquivo .env com suas credenciais${NC}"
echo -e "2. ${YELLOW}Adicione os repositórios frontend e backend (se ainda não fez)${NC}"
echo -e "3. ${YELLOW}Execute: ${GREEN}make dev${NC} ${YELLOW}para iniciar o ambiente${NC}"
echo ""
echo -e "${BLUE}Comandos úteis:${NC}"
echo -e "  ${GREEN}make help${NC}     - Ver todos os comandos disponíveis"
echo -e "  ${GREEN}make dev${NC}      - Iniciar ambiente de desenvolvimento"
echo -e "  ${GREEN}make logs${NC}     - Ver logs dos serviços"
echo -e "  ${GREEN}make status${NC}   - Ver status dos containers"
echo ""
