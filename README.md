# 🚀 Hero Infrastructure - Enterprise Docker Orchestration Platform

<div align="center">

![Hero Infra](https://img.shields.io/badge/Hero-Infrastructure-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**Infraestrutura completa de orquestração Docker com monitoramento em tempo real, ferramentas visuais e suporte multi-ambiente**

[🎯 Features](#-features) • [⚡ Quick Start](#-quick-start) • [📚 Documentation](#-documentation) • [🛠️ Commands](#️-available-commands)

</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Features](#-features)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Quick Start](#-quick-start)
- [Comandos Disponíveis](#️-comandos-disponíveis)
- [Ambientes](#-ambientes)
- [Monitoramento](#-monitoramento)
- [Dashboard Web](#-dashboard-web)
- [Visual Builder](#-visual-builder)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#️-configuração)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Visão Geral

**Hero Infrastructure** é uma plataforma completa de orquestração Docker projetada para simplificar o gerenciamento de infraestrutura complexa com múltiplos serviços. Ideal para equipes que trabalham com arquitetura de microsserviços e precisam de uma solução robusta, escalável e fácil de usar.

### 💡 Por que Hero Infrastructure?

- **🎛️ Gestão Visual**: Interface web intuitiva para gerenciar todos os serviços
- **📊 Monitoramento Real-time**: Métricas instantâneas de CPU, memória e rede
- **🔥 Hot Reload**: Sincronização automática de código com reload instantâneo
- **🎨 Visual Composer**: Crie docker-compose files arrastando e soltando
- **🚀 Multi-ambiente**: Dev, Staging e Prod isolados e configuráveis
- **🔒 Production-Ready**: Features empresariais de segurança e observabilidade
- **📦 One-Click Deploy**: Instale e gerencie serviços com um clique
- **👥 Team Collaboration**: Clone ambientes entre desenvolvedores

---

## ✨ Features

### 🎯 Core Features

| Feature | Descrição |
|---------|-----------|
| **Multi-Environment** | Suporte completo para Dev, Staging e Production |
| **Real-time Monitoring** | Dashboard com métricas ao vivo de todos os serviços |
| **Visual Builder** | Construa docker-compose files visualmente (drag & drop) |
| **Auto Code Sync** | Sincronização automática com hot-reload |
| **Web Terminal** | Terminal integrado para acesso direto aos containers |
| **One-Click Actions** | Instale, reinicie e gerencie serviços instantaneamente |
| **Database Migrations** | Migrações automáticas ao iniciar serviços |
| **Backup & Restore** | Sistema automático de backup com versionamento |
| **Environment Snapshots** | Capture e restaure estados completos do ambiente |
| **Health Checks** | Monitoramento contínuo da saúde dos serviços |

### 🔧 Developer Tools

- **🔥 Hot Reload** - Mudanças no código refletem instantaneamente
- **📝 Live Logs** - Logs em tempo real com filtros por serviço
- **🐚 Container Shell** - Acesso direto via web terminal
- **🔍 Network Inspector** - Visualize topologia e comunicação entre serviços
- **📊 Resource Monitor** - CPU, memória e uso de disco em tempo real
- **🧪 Test Runner** - Execute testes automatizados integrados

### 🛡️ Production Features

- **🔒 Security Scanning** - Trivy integrado para análise de vulnerabilidades
- **📈 Observability** - Stack completa Prometheus + Grafana + Alertmanager
- **🚨 Alerting** - Notificações automáticas para incidentes críticos
- **💾 Automated Backups** - Backups programados com retenção configurável
- **🔄 Zero-Downtime Deploy** - Estratégias de deploy sem interrupção
- **📦 Multi-Stage Builds** - Imagens Docker otimizadas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         HERO INFRASTRUCTURE                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser    │───▶│  Dashboard   │───▶│   Services   │
│              │    │  (Port 5000) │    │  Management  │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
        ┌───────────────────────────────────────┼───────────────┐
        │                                       │               │
        ▼                                       ▼               ▼
┌──────────────┐                        ┌──────────────┐ ┌──────────────┐
│    Nginx     │◀───────────────────────│   Frontend   │ │   Backend    │
│  (Port 80)   │                        │  (Port 3000) │ │ (Port 8080)  │
└──────────────┘                        └──────────────┘ └──────────────┘
        │                                       │               │
        │                                       └───────┬───────┘
        │                                               │
        ▼                                               ▼
┌──────────────┐                                ┌──────────────┐
│  Monitoring  │                                │    MySQL     │
│   Stack      │                                │  (Port 3306) │
│              │                                └──────────────┘
│ • Grafana    │                                        │
│ • Prometheus │                                        ▼
│ • AlertMgr   │                                ┌──────────────┐
└──────────────┘                                │    Redis     │
                                                │  (Port 6379) │
                                                └──────────────┘
```

### 🔄 Fluxo de Requisições

```
[Client] → [Nginx:80] → /api/*  → [Backend:8080]
                     → /*      → [Frontend:3000]
```

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0
- **Make** (geralmente já vem instalado no Linux/Mac)
- **Git**
- **Node.js** >= 18.0 (para dashboard e visual builder)
- **pnpm** >= 8.0 (recomendado) ou npm

### Verificação

```bash
docker --version
docker compose version
make --version
node --version
pnpm --version
```

---

## 🚀 Instalação

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/FelipePn10/infra-hero-geometric.git
cd infra-hero-geometric
```

### 2️⃣ Configure os Submódulos (Backend e Frontend)

**Opção A: Projetos Externos**
```bash
# Ajuste os caminhos no docker-compose.yml para seus projetos
# Exemplo:
services:
  backend:
    build:
      context: /caminho/para/seu/backend
```

**Opção B: Submódulos Git**
```bash
git submodule add https://github.com/FelipePn10/backend.git backend
git submodule add https://github.com/FelipePn10/frontend.git frontend
git submodule update --init --recursive
```

### 3️⃣ Setup Inicial

```bash
make setup
```

Este comando irá:
- ✅ Criar estrutura de diretórios necessária
- ✅ Configurar permissões dos scripts
- ✅ Gerar arquivos .env se necessário
- ✅ Verificar dependências

---

## ⚡ Quick Start

### Iniciar Ambiente Completo (Recomendado)

```bash
make all
```

Este comando inicia:
- ✅ Frontend e Backend
- ✅ Nginx (Proxy Reverso)
- ✅ MySQL Database
- ✅ Redis Cache
- ✅ Dashboard Web
- ✅ Visual Builder
- ✅ Stack de Monitoramento (Grafana + Prometheus)

### Iniciar Apenas Desenvolvimento

```bash
make dev
```

### Acessar os Serviços

Após iniciar, acesse:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Aplicação Principal** | http://localhost | Proxy Nginx |
| **Dashboard** | http://localhost:5000 | Interface de gerenciamento |
| **Visual Builder** | http://localhost:7000 | Construtor visual de compose |
| **Grafana** | http://localhost:3001 | Dashboards de métricas |
| **Prometheus** | http://localhost:9090 | Métricas e alertas |
| **Frontend** | http://localhost:3000 | Acesso direto ao frontend |
| **Backend API** | http://localhost:8080 | Acesso direto ao backend |
| **Database GUI** | http://localhost:8081 | phpMyAdmin |
| **Redis GUI** | http://localhost:8082 | Redis Commander |

---

## 🛠️ Comandos Disponíveis

### 📦 Setup & Inicialização

```bash
make setup          # Configuração inicial completa
make dev            # Inicia ambiente de desenvolvimento
make staging        # Inicia ambiente de staging
make prod           # Inicia ambiente de produção
make monitoring     # Inicia stack de monitoramento
make dashboard      # Inicia Web Dashboard + Auto-Sync
make all            # Inicia TUDO (dev + monitoring + dashboard)
make visual-builder # Abre Visual Builder no navegador
```

### 🚀 Gerenciamento de Serviços

```bash
make up             # Sobe todos os serviços (alias para make dev)
make down           # Para ambiente de desenvolvimento
make down-all       # Para TODOS os ambientes
make restart        # Reinicia todos os serviços
make rebuild        # Rebuilda e sobe os containers
make status         # Status de todos os containers
make ps             # Lista containers em execução
```

### 📊 Monitoramento & Logs

```bash
make logs           # Exibe últimos 100 logs
make logs-f         # Logs em tempo real (follow)
make logs-frontend  # Logs apenas do frontend
make logs-backend   # Logs apenas do backend
make logs-nginx     # Logs do proxy Nginx
make logs-db        # Logs do MySQL
make health         # Verifica saúde dos serviços
make top            # Estatísticas de CPU e memória
make metrics        # Abre Grafana no navegador
make prometheus     # Abre Prometheus no navegador
```

### 🔧 Manutenção

```bash
make backup         # Backup do banco de dados
make restore        # Restaura backup do banco
make snapshot       # Cria snapshot completo do ambiente
make list-snapshots # Lista snapshots disponíveis
make restore-snapshot # Restaura snapshot específico
make clean          # Remove containers, volumes e imagens
make clean-logs     # Limpa arquivos de log
make prune          # Remove recursos Docker não utilizados
```

### 🧪 Testes & CI/CD

```bash
make test              # Executa testes automatizados
make test-integration  # Testes de integração
make validate          # Valida arquivos de configuração
make security-scan     # Scan de segurança com Trivy
make ci-test           # Pipeline CI completo
```

### 🐚 Shell & Debug

```bash
make shell-frontend    # Acessa shell do container frontend
make shell-backend     # Acessa shell do container backend
make shell-db          # Acessa MySQL CLI
make shell-nginx       # Acessa shell do Nginx
make shell-redis       # Acessa Redis CLI
make inspect           # Inspeciona recursos Docker
```

### 📝 Utilitários

```bash
make help              # Exibe menu de ajuda completo
make check-ports       # Verifica conflitos de portas
make clone             # Clona ambiente para outro dev
```

---

## 🌍 Ambientes

### Development (dev)

Ambiente local para desenvolvimento com hot-reload ativo.

```bash
make dev
```

**Características:**
- Hot reload habilitado
- Volumes montados para código fonte
- Debug mode ativo
- Logs verbosos

### Staging

Ambiente de pré-produção para testes finais.

```bash
make staging
```

**Características:**
- Build otimizado
- Configurações próximas à produção
- Testes de integração

### Production (prod)

Ambiente de produção com otimizações e segurança.

```bash
make prod
```

**Características:**
- Multi-stage builds otimizados
- Health checks ativos
- Resource limits definidos
- Restart policies configuradas
- SSL/TLS configurado

---

## 📊 Monitoramento

### Stack de Observabilidade

Hero Infrastructure inclui uma stack completa de monitoramento:

#### Grafana (Port 3001)

Dashboard visual com métricas em tempo real.

**Login padrão:**
- Username: `admin`
- Password: `admin`

**Dashboards inclusos:**
- Hero Overview - Visão geral de todos os serviços
- Container Metrics - Métricas detalhadas por container
- Network Traffic - Tráfego de rede entre serviços
- Database Performance - Métricas do MySQL

#### Prometheus (Port 9090)

Coleta e armazena métricas de todos os serviços.

**Métricas disponíveis:**
- CPU usage por container
- Memory usage e limites
- Network I/O
- Disk usage
- Request rates
- Error rates

#### Alertmanager (Port 9093)

Gerencia e roteia alertas críticos.

**Alertas configurados:**
- Alta utilização de CPU (>80%)
- Alta utilização de memória (>85%)
- Serviço indisponível
- Disco cheio (>90%)
- Falhas de health check

---

## 🎛️ Dashboard Web

O Dashboard Web é a interface central de gerenciamento da infraestrutura.

### Features

- **📊 Real-time Monitoring**: Veja status de todos os serviços instantaneamente
- **🚀 Quick Actions**: Instale, inicie, pare e reinicie serviços com um clique
- **📝 Live Logs**: Visualize logs em tempo real com filtros
- **💻 Web Terminal**: Acesse terminal dos containers diretamente do navegador
- **📈 Metrics Dashboard**: Gráficos de uso de recursos
- **🔔 Notifications**: Alertas de status e eventos importantes

### Acesso

```bash
make dashboard
# ou
make all
```

Abra: http://localhost:5000

---

## 🎨 Visual Builder

Construa docker-compose files visualmente usando drag & drop.

### Features

- **🖱️ Drag & Drop**: Arraste serviços da biblioteca para o canvas
- **🔗 Visual Connections**: Conecte serviços visualmente
- **📝 Auto YAML Generation**: Gera docker-compose.yml automaticamente
- **📚 Service Templates**: Biblioteca com templates prontos (Redis, PostgreSQL, MongoDB, etc.)
- **✅ Real-time Validation**: Valida configurações enquanto você cria
- **💾 Export/Import**: Salve e carregue projetos

### Como Usar

1. Inicie o Visual Builder:
```bash
make visual-builder
```

2. Acesse: http://localhost:7000

3. Arraste serviços da sidebar para o canvas

4. Configure propriedades no painel direito

5. Conecte serviços clicando e arrastando

6. Exporte o docker-compose.yml gerado

---

## 📁 Estrutura do Projeto

```
infra-hero-geometric/
│
├── 📦 backend/                    # Backend service
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── ...
│
├── 📦 frontend/                   # Frontend service
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── ...
│
├── 🎛️ dashboard/                  # Web Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ServiceGrid.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── LiveLogs.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── Terminal/
│   │   ├── hooks/
│   │   │   └── useServices.ts
│   │   └── lib/
│   │       └── api.ts
│   ├── package.json
│   └── Dockerfile
│
├── 🎨 tools/
│   └── visual-builder/            # Visual Docker Compose Builder
│       ├── src/
│       │   ├── components/
│       │   │   ├── Canvas.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── ServiceNode.tsx
│       │   │   └── PropertiesPanel.tsx
│       │   └── lib/
│       │       ├── service-templates.ts
│       │       └── yaml-generator.ts
│       └── package.json
│
├── 🔧 nginx/                      # Proxy configuration
│   ├── nginx.conf
│   └── ssl/
│
├── 📊 monitoring/                 # Monitoring stack
│   ├── grafana/
│   │   └── dashboards/
│   │       └── hero-overview.json
│   └── alertmanager/
│       └── alertmanager.yml
│
├── 🗄️ mysql/                      # Database configs
│   └── init/
│
├── 📝 logs/                       # Centralized logs
│   ├── frontend/
│   ├── backend/
│   ├── nginx/
│   └── mysql/
│
├── 💾 backups/                    # Database backups
│
├── 🔧 scripts/                    # Automation scripts
│   ├── setup.sh
│   ├── start.sh
│   ├── deploy-production.sh
│   ├── backup.sh
│   ├── restore.sh
│   ├── health-check.sh
│   ├── check-ports.sh
│   ├── auto-sync.js              # Hot reload sync
│   └── run-tests.sh
│
├── 🐳 Docker Compose Files
│   ├── docker-compose.yml         # Development
│   ├── docker-compose.staging.yml
│   ├── docker-compose.prod.yml
│   ├── docker-compose.monitoring.yml
│   └── docker-compose.dashboard.yml
│
├── 🛠️ Makefile                    # Command automation
├── 📖 README.md
├── 📜 LICENSE
└── 🔒 .env.example
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Database
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=hero
MYSQL_USER=hero_user
MYSQL_PASSWORD=your_user_password

# Redis
REDIS_PASSWORD=your_redis_password

# Backend
BACKEND_PORT=8080
NODE_ENV=development

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8080

# Monitoring
GRAFANA_ADMIN_PASSWORD=admin
PROMETHEUS_RETENTION_TIME=15d

# Dashboard
DASHBOARD_PORT=5000
VISUAL_BUILDER_PORT=7000
```

### Personalizando Serviços

#### Adicionar Novo Serviço

1. Edite `docker-compose.yml`:

```yaml
services:
  meu-servico:
    container_name: hero-meu-servico
    build:
      context: ./meu-servico
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    networks:
      - hero-network
    volumes:
      - ./meu-servico:/app
```

2. Atualize o Nginx se necessário:

```nginx
location /meu-servico/ {
  proxy_pass http://meu-servico:4000/;
}
```

3. Reinicie:

```bash
make rebuild
```

---

## 🔍 Troubleshooting

### Porta Ocupada

```bash
# Verificar portas em uso
make check-ports

# Liberar porta específica
lsof -ti:80 | xargs kill -9
```

### Container Não Inicia

```bash
# Ver logs detalhados
make logs-f

# Verificar health
make health

# Rebuild forçado
make rebuild
```

### Problemas com Volume

```bash
# Limpar volumes
docker volume prune -f

# Remover volume específico
docker volume rm hero_db_data
```

### Reset Completo

```bash
# Para tudo e limpa
make clean

# Recomeça do zero
make setup
make all
```

### Database Connection Issues

```bash
# Acessa MySQL CLI
make shell-db

# Verifica status
docker exec hero-mysql mysqladmin -uroot -p status
```

---

## 🤝 Contributing

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines

- Siga os padrões de código existentes
- Adicione testes quando aplicável
- Atualize a documentação
- Use commits semânticos (feat, fix, docs, etc.)

---

## 📄 License

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- Docker & Docker Compose pela plataforma incrível
- Grafana & Prometheus pela stack de observabilidade
- Todas as bibliotecas open-source utilizadas

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/FelipePn10/infra-hero-geometric/issues)
- **Discussions**: [GitHub Discussions](https://github.com/FelipePn10/infra-hero-geometric/discussions)
- **Email**: seu-email@example.com

---

<div align="center">

**Feito com ❤️ para simplificar a vida dos desenvolvedores**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>

[![GitHub stars](https://img.shields.io/github/stars/FelipePn10/infra-hero-geometric.svg?style=social)](https://github.com/FelipePn10/infra-hero-geometric/stargazers)
