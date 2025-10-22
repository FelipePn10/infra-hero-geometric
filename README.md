# 🚀 Hero Infrastructure

<div align="center">

**Plataforma completa de orquestração Docker com gerenciamento visual, hot-reload automático e monitoramento em tempo real.**

*Transforme infraestrutura complexa em uma experiência visual e produtiva.*

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Commands](#-comandos-disponíveis)

---

</div>

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Por que Hero Infrastructure?](#-por-que-hero-infrastructure)
- [Features](#-features)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Quick Start](#-quick-start)
- [Comandos Disponíveis](#-comandos-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Dashboard Web](#-dashboard-web)
- [Visual Builder](#-visual-builder)
- [Ambientes](#-ambientes)
- [Configuração](#️-configuração)
- [Monitoramento](#-monitoramento)
- [Scripts Automáticos](#-scripts-automáticos)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

**Hero Infrastructure** é uma plataforma agnóstica de orquestração Docker que simplifica o gerenciamento de infraestrutura multi-serviço. Funciona como um "painel de controle universal" para qualquer stack de desenvolvimento - independente da tecnologia que você usa.

### 💡 O Diferencial

Não é apenas mais um template Docker. É uma **plataforma completa** que:
- Aceita **qualquer tecnologia** (Node, Go, Python, PHP, Java...)
- Fornece **ferramentas visuais** para gerenciamento
- Inclui **monitoramento enterprise-grade** out-of-the-box
- Automatiza tarefas repetitivas com **scripts inteligentes**
- Facilita **colaboração em equipe** com ambientes reproduzíveis

---

## 🤔 Por que Hero Infrastructure?

### Antes ❌
```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev

# Terminal 3
docker run -d mysql...

# Terminal 4
docker run -d redis...

# Como eu sei se está tudo funcionando? 🤷
```

### Depois ✅
```bash
make all
```

**Resultado:** Dashboard visual mostra todos os serviços, logs em tempo real, métricas de recursos, terminal integrado e controles one-click. Tudo em `http://localhost:5000`

---

## ✨ Features

### 🎛️ Dashboard Web Interativo
- **Real-time Monitoring** - Status de todos os serviços ao vivo
- **One-Click Actions** - Inicie, pare, reinicie serviços instantaneamente
- **Live Logs** - Visualize logs com filtros por serviço/severity
- **Web Terminal** - Acesse shell dos containers sem CLI
- **Resource Metrics** - CPU, memória, rede e disco em tempo real
- **Service Discovery** - Detecta automaticamente novos serviços

### 🎨 Visual Builder (Drag & Drop)
- **Compose Visualmente** - Arraste serviços, conecte-os, gere YAML
- **20+ Templates Prontos** - Redis, PostgreSQL, MongoDB, Elasticsearch...
- **Validação em Tempo Real** - Detecta erros antes de subir
- **Export/Import** - Compartilhe configurações com o time
- **Network Topology** - Visualize comunicação entre serviços

### 🔥 Developer Experience

| Feature | Descrição |
|---------|-----------|
| **Hot Reload Inteligente** | Detecta mudanças e recarrega automaticamente |
| **Auto Code Sync** | Sincronização bidirecional entre host e container |
| **Auto Migrations** | Executa migrations ao iniciar banco de dados |
| **Port Conflict Detection** | Verifica conflitos antes de subir containers |
| **Health Checks** | Monitora saúde e reinicia automaticamente se necessário |

### 📊 Observabilidade Enterprise

- **Grafana** com dashboards pré-configurados
- **Prometheus** coletando métricas de todos os serviços
- **Alertmanager** para notificações críticas
- **Log Aggregation** centralizada
- **Custom Metrics** - Adicione suas próprias métricas facilmente

### 🛡️ Production-Ready

- **Multi-Environment** - Dev, Staging e Production isolados
- **Zero-Downtime Deploy** - Estratégias blue-green prontas
- **Automated Backups** - Backup programado de databases
- **Snapshots** - Capture e restaure estados completos
- **Security Scanning** - Trivy integrado para vulnerabilidades
- **SSL/TLS** - Certificados auto-gerados para desenvolvimento

### 🤝 Collaboration Features

- **Environment Cloning** - Clone seu setup para outro dev em segundos
- **Reproducible Builds** - Ambientes idênticos entre máquinas
- **Shared Configs** - Versionamento centralizado de configurações
- **Team Dashboards** - Visão compartilhada do estado da infra

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎛️  WEB DASHBOARD (5000)                     │
│         Real-time Monitoring • One-Click Actions • Terminal     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │────▶ │    Nginx     │────▶   Your Stack
│              │      │   (Port 80)  │      │              │
└──────────────┘      └──────────────┘      │ • Frontend   │
                              │             │ • Backend    │
                              │             │ • APIs       │
                              │             │ • Services   │
                              ▼             └──────────────┘
                      ┌──────────────┐             │
                      │ Monitoring   │             │
                      │              │             ▼
                      │ • Grafana    │     ┌──────────────┐
                      │ • Prometheus │     │  Data Layer  │
                      │ • AlertMgr   │     │              │
                      └──────────────┘     │ • MySQL      │
                                           │ • Redis      │
                                           │ • PostgreSQL │
                                           └──────────────┘
```

### 🔄 Fluxo de Requisições

```
Client → Nginx:80 → /api/*     → Your Backend
                 → /           → Your Frontend
                 → /dashboard  → Hero Dashboard
                 → /builder    → Visual Builder
```

---

## 📋 Pré-requisitos

### Obrigatórios

- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0 (ou Docker Desktop)
- **Make** (Linux/Mac já vem instalado)

### Opcionais (mas recomendados)

- **Git** - Para versionamento
- **curl** - Para health checks
- **openssl** - Para gerar certificados SSL

### Verificação Rápida

```bash
docker --version        # Docker version 20.10.0+
docker compose version  # Docker Compose version v2.0.0+
make --version         # GNU Make 4.0+
```

---

## ⚡ Quick Start

### Clone e Configure

```bash
# Clone o repositório
git clone https://github.com/FelipePn10/infra-hero-geometric.git
cd infra-hero-geometric

# Adicione seus projetos (ajuste os caminhos)
# Edite docker-compose.yml com caminhos absolutos

# Setup inicial (cria estrutura, .env, scripts)
make setup
```

### Ajuste o docker-compose.yml

Edite `docker-compose.yml` e aponte para seus projetos:

```yaml
frontend:
  build:
    context: /caminho/para/seu/frontend  # ← Seu projeto aqui
    dockerfile: Dockerfile.dev           # ← Seu Dockerfile
  # ...

backend:
  build:
    context: /caminho/para/seu/backend   # ← Seu projeto aqui
    dockerfile: Dockerfile.dev           # ← Seu Dockerfile
  # ...
```

### Inicie Tudo

```bash
# Inicia ambiente completo (dev + monitoring + dashboard)
make all
```

Aguarde alguns segundos e acesse:

| Interface | URL | Descrição |
|-----------|-----|-----------|
| **🎛️ Dashboard** | http://localhost:5000 | Controle tudo daqui |
| **🎨 Visual Builder** | http://localhost:7000 | Construa compose visualmente |
| **📊 Grafana** | http://localhost:3001 | Métricas e dashboards (admin/admin) |
| **🔍 Prometheus** | http://localhost:9090 | Query de métricas |
| **🌐 Sua App** | http://localhost | Proxy Nginx |

### Verifique a Saúde

```bash
make health
```

**Pronto! 🎉** Seu ambiente está rodando com monitoramento completo!

---

## 🛠️ Comandos Disponíveis

### 📦 Inicialização e Setup

```bash
make setup          # Setup inicial (run apenas uma vez)
make dev            # Inicia ambiente de desenvolvimento
make staging        # Inicia ambiente de staging
make prod           # Inicia ambiente de produção
make monitoring     # Inicia apenas stack de observabilidade
make dashboard      # Inicia apenas dashboard + auto-sync
make all            # Inicia TUDO (recomendado)
```

### 🚀 Gerenciamento de Serviços

```bash
make up             # Sobe ambiente dev (alias para make dev)
make down           # Para ambiente dev
make down-all       # Para TODOS os ambientes (dev + staging + prod + monitoring)
make restart        # Reinicia serviços
make rebuild        # Rebuilda imagens e reinicia
make status         # Mostra status de todos os containers
make ps             # Lista containers em execução
```

### 📊 Logs e Monitoramento

```bash
make logs           # Últimos 100 logs de todos os serviços
make logs-f         # Segue logs em tempo real
make logs-frontend  # Logs apenas do frontend
make logs-backend   # Logs apenas do backend
make logs-nginx     # Logs do Nginx
make logs-db        # Logs do MySQL
make health         # Health check de todos os serviços
make top            # Estatísticas de CPU e memória
make metrics        # Abre Grafana no navegador
make prometheus     # Abre Prometheus no navegador
```

### 🔧 Manutenção e Backup

```bash
make backup         # Cria backup
make restore        # Restaura backup (lista disponíveis)
make snapshot       # Snapshot completo do ambiente
make clean          # Remove containers, volumes e imagens
make clean-logs     # Limpa arquivos de log
make prune          # Remove recursos Docker não utilizados
```

### 🧪 Testes e Validação

```bash
make test              # Executa testes automatizados
make test-integration  # Testes de integração
make validate          # Valida todos os docker-compose.yml
make security-scan     # Scan de segurança com Trivy
make check-ports       # Verifica conflitos de porta
```

### 🐚 Debug e Shell

```bash
make shell-frontend  # Shell interativo do container frontend
make shell-backend   # Shell interativo do container backend
make shell-db        # MySQL CLI
make shell-nginx     # Shell do Nginx
make shell-redis     # Redis CLI
make inspect         # Inspeciona recursos Docker (volumes, networks)
```

### 📝 Utilitários

```bash
make help           # Menu de ajuda completo
make visual-builder # Abre Visual Builder no navegador
make clone          # Prepara ambiente para clonar para outro dev
```

---

## 📁 Estrutura do Projeto

```
infra-hero-geometric/
│
├── 📦 backend/                   # Seu projeto backend (qualquer tech)
│   ├── Dockerfile.dev            # Dockerfile para desenvolvimento
│   ├── Dockerfile.prod           # Dockerfile para produção
│   └── ...                       # Seu código
│
├── 📦 frontend/                  # Seu projeto frontend (qualquer tech)
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── ...                       # Seu código
│
├── 🎛️ dashboard/                 # Dashboard Web (React + TypeScript)
│   ├── src/
│   │   ├── components/           # Componentes UI
│   │   │   ├── Dashboard.tsx     # Dashboard principal
│   │   │   ├── ServiceGrid.tsx   # Grid de serviços
│   │   │   ├── StatsOverview.tsx # Estatísticas em tempo real
│   │   │   ├── LiveLogs.tsx      # Visualizador de logs
│   │   │   ├── QuickActions.tsx  # Ações rápidas
│   │   │   └── Terminal/         # Terminal web
│   │   ├── hooks/
│   │   │   └── useServices.ts    # Hook de gerenciamento de serviços
│   │   └── lib/
│   │       └── api.ts            # Cliente API
│   ├── package.json              # React 18 + Vite + Tailwind
│   └── Dockerfile
│
├── 🎨 tools/
│   └── visual-builder/           # Visual Docker Compose Builder
│       ├── src/
│       │   ├── components/
│       │   │   ├── Canvas.tsx          # Canvas drag-and-drop
│       │   │   ├── Sidebar.tsx         # Biblioteca de serviços
│       │   │   ├── ServiceNode.tsx     # Nó de serviço visual
│       │   │   ├── PropertiesPanel.tsx # Editor de propriedades
│       │   │   └── Toolbar.tsx         # Barra de ferramentas
│       │   ├── lib/
│       │   │   ├── service-templates.ts # Templates prontos
│       │   │   └── yaml-generator.ts    # Gerador de YAML
│       │   └── types/
│       └── package.json          # React + @dnd-kit + Zod
│
├── 🔧 nginx/                     # Configuração Nginx
│   ├── nginx.conf                # Proxy reverso configurado
│   └── ssl/                      # Certificados SSL (auto-gerados)
│       ├── cert.pem
│       └── key.pem
│
├── 📊 monitoring/                 # Stack de Observabilidade
│   ├── grafana/
│   │   └── dashboards/
│   │       └── hero-overview.json # Dashboard pré-configurado
│   └── alertmanager/
│       └── alertmanager.yml      # Configuração de alertas
│
│
├── 📝 logs/                      # Logs Centralizados
│   ├── frontend/
│   ├── backend/
│   ├── nginx/
│   ├── mysql/
│   └── redis/
│
├── 💾 backups/                   # Backups Automatizados
│   ├── database/                 # Backups
│   ├── snapshots/                # Snapshots de ambiente
│   └── configs/                  # Backup de configurações
│
├── 🔧 scripts/                   # Scripts de Automação
│   ├── setup.sh                  # Setup inicial completo
│   ├── start.sh                  # Inicialização com validações
│   ├── health-check.sh           # Health check de serviços
│   ├── check-ports.sh            # Verificação de portas
│   ├── backup.sh                 # Backup automático MySQL
│   ├── restore.sh                # Restauração de backup
│   ├── auto-sync.js              # Sincronização de código
│   └── run-tests.sh              # Executor de testes
│
├── 🐳 Docker Compose Files
│   ├── docker-compose.yml              # Desenvolvimento
│   ├── docker-compose.staging.yml      # Staging
│   ├── docker-compose.prod.yml         # Produção
│   ├── docker-compose.monitoring.yml   # Observabilidade
│   └── docker-compose.dashboard.yml    # Dashboard + Tools
│
├── 🛠️ Makefile                    # 60+ comandos automatizados
├── 📖 README.md                   # Este arquivo
├── 📜 LICENSE                     # MIT License
├── 🔒 .env                        # Variáveis de ambiente
└── .env.example                   # Template de .env
```

---

## 🎛️ Dashboard Web

O Dashboard é o coração da Hero Infrastructure - uma interface web moderna que centraliza todo o gerenciamento.

### Features do Dashboard

#### 📊 Service Grid
- Card visual para cada serviço com status colorido
- Indicadores de saúde em tempo real
- Uso de recursos (CPU, memória)
- Uptime e último restart

#### ⚡ Quick Actions
```
┌───────────────────────────────────────┐
│  [▶️ Start]  [⏸️ Stop]  [🔄 Restart]   │
│  [🗑️ Remove]  [📊 Logs]  [💻 Shell]   │
└───────────────────────────────────────┘
```

#### 📝 Live Logs
- Streaming de logs em tempo real
- Filtros por serviço e severity
- Search e highlight de termos
- Auto-scroll e pause
- Export para arquivo

#### 💻 Web Terminal
- Terminal xterm.js integrado
- Acesso direto aos containers
- Tab completion
- Histórico de comandos
- Copy/paste funcional

#### 📈 Metrics Dashboard
- Gráficos em tempo real (Recharts)
- CPU usage por container
- Memory usage e limites
- Network I/O
- Disk usage

### Tecnologias do Dashboard

```json
{
  "frontend": "React 18 + TypeScript",
  "build": "Vite 5",
  "styling": "Tailwind CSS",
  "state": "Zustand + TanStack Query",
  "charts": "Recharts",
  "ui": "Radix UI + Framer Motion",
  "api": "Axios + Zod validation"
}
```

---

## 🎨 Visual Builder

Construa arquivos `docker-compose.yml` visualmente usando drag-and-drop.

### Como Usar

1. **Acesse**: http://localhost:7000

2. **Arraste Serviços** da sidebar para o canvas
   - 20+ templates prontos (Redis, PostgreSQL, MongoDB, Elasticsearch...)
   - Ou crie serviços custom

3. **Configure Propriedades**
   - Portas, volumes, environment variables
   - Dependencies, networks, restart policies
   - Resource limits (CPU, memória)

4. **Conecte Visualmente**
   - Clique e arraste entre serviços
   - Define dependências e comunicação

5. **Valide em Tempo Real**
   - Erros destacados imediatamente
   - Sugestões de correção

6. **Exporte YAML**
   - Gera `docker-compose.yml` válido
   - Copia ou salva direto no projeto

### Templates Inclusos

- **Databases**: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch
- **Message Queues**: RabbitMQ, Kafka, NATS
- **Caching**: Redis, Memcached
- **Monitoring**: Prometheus, Grafana, Jaeger
- **Proxies**: Nginx, Traefik, HAProxy
- **Tools**: Adminer, phpMyAdmin, Redis Commander

---

## 🌍 Ambientes

Hero Infrastructure suporta múltiplos ambientes isolados com configurações específicas.

### Development

**Características:**
- Hot reload ativo
- Volumes montados (code sync)
- Debug mode habilitado
- Logs verbosos
- Sem resource limits
- Databases com dados de teste

**Iniciar:**
```bash
make dev
```

### Staging

**Características:**
- Build otimizado (multi-stage)
- Configurações próximas a prod
- Resource limits definidos
- Testes de integração
- Databases com dados sanitizados

**Iniciar:**
```bash
make staging
```

### Production

**Características:**
- Builds otimizados e minificados
- Health checks ativos
- Resource limits estritos
- Restart policies configuradas
- SSL/TLS obrigatório
- Backups automáticos
- Monitoring completo

**Iniciar:**
```bash
make prod
```

---

## ⚙️ Configuração

### Arquivo .env

O setup cria automaticamente um `.env` com valores padrão. Ajuste conforme necessário:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=hero_root_2024
MYSQL_DATABASE=hero_infra
MYSQL_USER=hero_user
MYSQL_PASSWORD=hero_pass_2024

# Redis Configuration
REDIS_PASSWORD=redis_hero_2024

# Backend API
BACKEND_PORT=8080
JWT_SECRET=hero_jwt_secret_2024_change_in_production

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8080/api

# Dashboard
DASHBOARD_PORT=5000
VISUAL_BUILDER_PORT=7000

# Monitoring
GRAFANA_PORT=3001
PROMETHEUS_PORT=9090

# Features
HOT_RELOAD=true
AUTO_MIGRATIONS=true
AUTO_BACKUP=true
BACKUP_RETENTION_DAYS=7
```

### Adicionando Novos Serviços

#### 1. Edite docker-compose.yml

```yaml
services:
  seu-servico:
    container_name: hero-seu-servico
    build:
      context: ./seu-servico
      dockerfile: Dockerfile.dev
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./seu-servico:/app
    networks:
      - hero-network
    restart: unless-stopped
```

#### 2. Configure Nginx (se necessário)

```nginx
location /seu-servico/ {
  proxy_pass http://seu-servico:4000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

#### 3. Reinicie

```bash
make rebuild
```

---

## 📊 Monitoramento

### Stack de Observabilidade

```
Grafana (3001) ─┐
                ├─→ Dashboards Visuais
Prometheus (9090) ┘
         │
         ├─→ Coleta Métricas
         │
         └─→ Alertas → Alertmanager (9093)
```

### Dashboards Inclusos

#### Hero Overview
- Status geral de todos os serviços
- CPU e memória agregados
- Network traffic total
- Alertas ativos

#### Container Metrics
- Métricas individuais por container
- CPU usage ao longo do tempo
- Memory usage e swaps
- Disk I/O
- Network I/O

#### Database Performance
- Query performance MySQL
- Connections ativas
- Slow queries
- Cache hit rate

### Alertas Configurados

| Alerta | Condição | Severidade |
|--------|----------|------------|
| High CPU | CPU > 80% por 5min | Warning |
| Critical CPU | CPU > 95% por 2min | Critical |
| High Memory | Memory > 85% | Warning |
| Service Down | Health check falha | Critical |
| Disk Full | Disk > 90% | Critical |

### Acessar Monitoring

```bash
make metrics     # Abre Grafana
make prometheus  # Abre Prometheus

# Credenciais Grafana
# Username: admin
# Password: admin (altere no primeiro login)
```

---

## 🤖 Scripts Automáticos

### Auto-Sync (Code Synchronization)

Detecta mudanças no código e sincroniza automaticamente com containers.

**Funciona com:**
- Frontend (hot reload automático)
- Backend (nodemon/air/etc detecta mudanças)
- Nginx configs (reload sem downtime)

**Configuração:** Já ativo quando você usa `make dev` ou `make dashboard`

### Auto-Migrations

Executa migrations automaticamente ao iniciar o banco de dados.

**Suporta:**
- Sequelize (Node.js)
- TypeORM (Node.js/TypeScript)
- Knex (Node.js)
- GORM (Go)
- Alembic (Python)

**Localização:** `backend/migrations/`

### Auto-Backup

Backup automático programado do MySQL.

**Configuração:**
```bash
# .env
AUTO_BACKUP=true
BACKUP_RETENTION_DAYS=7  # Mantém backups por 7 dias
```

**Execução manual:**
```bash
make backup
```

**Restaurar:**
```bash
make restore
# Lista backups disponíveis e pede qual restaurar
```

---

## 🔍 Troubleshooting

### Porta Já em Uso

```bash
# Verifica conflitos antes de subir
make check-ports

# Identifica processo usando porta
lsof -i :80
lsof -i :3000

# Mata processo
kill -9 <PID>
```

### Container Não Inicia

```bash
# Ver logs detalhados
make logs-f

# Verificar health
make health

# Rebuild forçado
make clean
make rebuild
```

### Erro de Permissão

```bash
# Linux: adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Redefine permissões
chmod -R 755 logs/ data/ backups/
```

### Database Connection Failed

```bash
# Verifica se MySQL está rodando
docker ps | grep hero-mysql

# Acessa MySQL CLI
make shell-db

# Testa conexão
docker exec hero-mysql mysqladmin -uroot -p<password> ping
```

### Hot Reload Não Funciona

```bash
# Certifique-se que volumes estão montados
docker inspect hero-frontend | grep -A 10 Mounts

# Linux: pode precisar aumentar inotify watches
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Dashboard Não Carrega

```bash
# Verifica se está rodando
docker ps | grep hero-dashboard

# Reinicia dashboard
docker restart hero-dashboard

# Logs do dashboard
make logs-dashboard
```

### Reset Completo

```bash
# Para tudo
make down-all

# Remove tudo (containers, volumes, imagens)
make clean

# Recomeça do zero
make setup
make all
```

---

## 🤝 Contributing

Contribuições são muito bem-vindas! Este projeto é feito pela comunidade, para a comunidade.

### Como Contribuir

1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Adicione testes quando aplicável
- Atualize documentação
- Mantenha consistência de código
- Teste em múltiplos ambientes

### Reportar Bugs

Abra uma [Issue](https://github.com/FelipePn10/infra-hero-geometric/issues) incluindo:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Versão do Docker/Docker Compose
- Sistema operacional

---

## 📄 License

Este projeto está licenciado sob a **MIT License**.

Você é livre para:
- ✅ Usar comercialmente
- ✅ Modificar
- ✅ Distribuir
- ✅ Uso privado

Veja o arquivo [LICENSE](LICENSE) para detalhes completos.

---

## 🙏 Agradecimentos

Este projeto não seria possível sem:

- **Docker** - Por tornar containers mainstream
- **Grafana & Prometheus** - Stack de observabilidade incrível
- **React & Vite** - Desenvolvimento frontend moderno
- **Tailwind CSS** - Styling sem dor de cabeça
- **@dnd-kit** - Drag and drop poderoso
- **Toda a comunidade Open Source** ❤️

---

## 📞 Suporte e Comunidade

- 🐛 **Bugs**: [GitHub Issues](https://github.com/FelipePn10/infra-hero-geometric/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/FelipePn10/infra-hero-geometric/discussions)
- 📧 **Email**: seu-email@example.com
- 🐦 **Twitter**: [@seu-twitter](https://twitter.com/seu-twitter)

---

## 🗺️ Roadmap

### Em Desenvolvimento
- [ ] Kubernetes integration
- [ ] CI/CD pipeline templates
- [ ] Multi-cloud deployment (AWS, GCP, Azure)
- [ ] Service mesh support (Istio/Linkerd)

### Planejado
- [ ] Plugin system para extensões
- [ ] Marketplace de templates
- [ ] Multi-tenancy support
- [ ] Advanced networking (VPN, mesh)

### Ideias Futuras
- [ ] AI-powered optimization suggestions
- [ ] Cost estimation per service
- [ ] Automated scaling recommendations
- [ ] Integration com ChatGPT/Claude para debugging

---

## 🎓 Tutoriais e Guias

### Caso de Uso 1: Stack MERN

```bash
# 1. Estruture seus projetos
infra-hero-geometric/
├── frontend/          # React app
├── backend/           # Express API
└── docker-compose.yml # Hero infra

# 2. Configure docker-compose.yml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    environment:
      - REACT_APP_API_URL=http://localhost:8080

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      - MONGODB_URI=mongodb://mongo:27017/myapp

# 3. Adicione MongoDB
# Use o Visual Builder ou adicione manualmente:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

# 4. Inicie
make all
```

### Caso de Uso 2: Microservices em Go

```yaml
# docker-compose.yml
services:
  api-gateway:
    build: ./services/gateway
    ports:
      - "8080:8080"

  auth-service:
    build: ./services/auth
    depends_on:
      - postgres

  user-service:
    build: ./services/users
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

```bash
# Inicie tudo
make dev

# Monitore no dashboard
open http://localhost:5000

# Veja logs de um serviço específico
docker logs -f hero-auth-service
```

### Caso de Uso 3: Full Stack Python

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend  # React/Vue/etc

  backend:
    build: ./backend   # FastAPI/Django
    command: uvicorn app:app --reload
    volumes:
      - ./backend:/app

  celery:
    build: ./backend
    command: celery -A app worker
    depends_on:
      - redis

  redis:
    image: redis:alpine
```

---

## 📚 FAQ

### Posso usar com projetos existentes?

**Sim!** Hero Infrastructure é agnóstico. Basta:
1. Ajustar os caminhos no `docker-compose.yml`
2. Garantir que seus projetos têm `Dockerfile.dev`
3. Executar `make all`

### Funciona no Windows?

**Sim!** Use WSL2 + Docker Desktop. Todos os scripts são compatíveis.

```bash
# No WSL2
cd /mnt/c/Users/SeuUsuario/projetos
git clone <repo>
make setup
make all
```

### Como adiciono mais serviços?

Duas formas:

**1. Visual Builder** (recomendado)
- Acesse http://localhost:7000
- Arraste o serviço desejado
- Configure e exporte

**2. Manual**
- Edite `docker-compose.yml`
- Adicione seu serviço
- Execute `make rebuild`

### Posso usar em produção?

**Sim!** Use os comandos específicos:

```bash
make prod           # Inicia em modo produção
make deploy-prod    # Deploy automatizado
```

Certifique-se de:
- ✅ Configurar SSL/TLS real
- ✅ Trocar senhas padrão
- ✅ Configurar backups automáticos
- ✅ Habilitar alertas no Alertmanager

### Como faço backup antes de updates?

```bash
# Snapshot completo
make snapshot

# Backup apenas do banco
make backup

# Restaurar se algo der errado
make restore-snapshot
```

### O Dashboard funciona com Kubernetes?

Atualmente não, mas está no roadmap. Por enquanto, Hero Infrastructure é focado em Docker/Docker Compose.

### Posso customizar os dashboards do Grafana?

**Sim!**
- Acesse http://localhost:3001
- Crie/edite dashboards
- Salve o JSON em `monitoring/grafana/dashboards/`
- Commite para versionar

### Como adiciono autenticação?

Exemplo com JWT:

```yaml
# docker-compose.yml
backend:
  environment:
    - JWT_SECRET=${JWT_SECRET}
    - JWT_EXPIRES_IN=7d

# .env
JWT_SECRET=seu_secret_super_seguro_aqui
```

No código do backend, implemente JWT normalmente.

### Posso rodar múltiplos projetos simultaneamente?

**Sim!** Clone o repositório em pastas diferentes e ajuste as portas:

```bash
# Projeto 1
cd ~/projeto-a
# Edite .env: FRONTEND_PORT=3000, DASHBOARD_PORT=5000
make all

# Projeto 2
cd ~/projeto-b
# Edite .env: FRONTEND_PORT=3001, DASHBOARD_PORT=5001
make all
```

Ambos rodam isolados com seus próprios dashboards.

---

## 💡 Dicas e Truques

### Desenvolvimento mais Rápido

```bash
# Inicie apenas o que precisa
docker compose up frontend backend mysql -d

# Monitore logs de serviços específicos
make logs-frontend & make logs-backend

# Use aliases no .bashrc/.zshrc
alias hi='cd ~/infra-hero && make'
alias hil='cd ~/infra-hero && make logs-f'
alias his='cd ~/infra-hero && make status'
```

### Otimize Builds

```bash
# Use cache do Docker
docker compose build --parallel

# BuildKit para builds mais rápidos
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Multi-stage builds nos seus Dockerfiles
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

### Debug Avançado

```bash
# Inspeciona container
docker inspect hero-backend | jq

# Estatísticas em tempo real
docker stats

# Analisa uso de disco
docker system df

# Visualiza networks
docker network inspect hero-network
```

### Automação com Git Hooks

```bash
# .git/hooks/pre-push
#!/bin/bash
make validate
make test
make security-scan
```

---

## 🔗 Links Úteis

### Documentação Oficial
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Grafana Docs](https://grafana.com/docs/)
- [Prometheus Docs](https://prometheus.io/docs/)

### Recursos da Comunidade
- [Awesome Docker](https://github.com/veggiemonk/awesome-docker)
- [Docker Compose Examples](https://github.com/docker/awesome-compose)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

### Ferramentas Complementares
- [Portainer](https://www.portainer.io/) - GUI alternativa para Docker
- [ctop](https://github.com/bcicen/ctop) - Top para containers
- [lazydocker](https://github.com/jesseduffield/lazydocker) - TUI para Docker
- [dive](https://github.com/wagoodman/dive) - Analisa camadas de imagens

---

## 📊 Estatísticas do Projeto

```
📦 Serviços Suportados: Ilimitado
🎨 Templates Prontos: 20+
⚡ Setup Time: < 5 minutos
🛠️ Comandos Make: 60+
📈 Dashboards: 3 pré-configurados
🔧 Scripts Automáticos: 10+
🌍 Ambientes: Dev, Staging, Prod
💾 Backup: Automático
📊 Monitoramento: Real-time
🎯 Cobertura: Multi-stack
```

---

<div align="center">

## 🚀 Comece Agora!

```bash
git clone https://github.com/FelipePn10/infra-hero-geometric.git
cd infra-hero-geometric
make setup
make all
```

**Em menos de 5 minutos você terá infraestrutura enterprise rodando! 🎉**

---

### ⭐ Se este projeto te ajudou, considere dar uma estrela!

[![GitHub stars](https://img.shields.io/github/stars/FelipePn10/infra-hero-geometric.svg?style=social&label=Star)](https://github.com/FelipePn10/infra-hero-geometric)

---

**Hero Infrastructure** - *Simplificando infraestrutura complexa, um container de cada vez.*

Made with ❤️ by developers, for developers

[⬆ Voltar ao topo](#-hero-infrastructure)

</div>
