#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ██╗  ██╗███████╗██████╗  ██████╗                      ║
║     ██║  ██║██╔════╝██╔══██╗██╔═══██╗                     ║
║     ███████║█████╗  ██████╔╝██║   ██║                     ║
║     ██╔══██║██╔══╝  ██╔══██╗██║   ██║                     ║
║     ██║  ██║███████╗██║  ██║╚██████╔╝                     ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝                      ║
║                                                           ║
║              INFRA - Complete Setup                       ║
║              Developer Experience First                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF

echo ""
echo -e "${CYAN}Starting Hero Infra installation...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please do not run as root${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/10] Checking system requirements...${NC}"

# OS Detection
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo -e "${GREEN}✅ OS: Linux${NC}"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo -e "${GREEN}✅ OS: macOS${NC}"
else
    echo -e "${RED}❌ Unsupported OS: $OSTYPE${NC}"
    exit 1
fi

echo -e "${YELLOW}[2/10] Checking Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing...${NC}"

    if [ "$OS" = "linux" ]; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo -e "${GREEN}✅ Docker installed${NC}"
        echo -e "${YELLOW}⚠️  Please logout and login again for Docker permissions${NC}"
    elif [ "$OS" = "macos" ]; then
        echo -e "${YELLOW}Please install Docker Desktop from: https://www.docker.com/products/docker-desktop${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found${NC}"
    echo -e "${YELLOW}Installing Docker Compose...${NC}"

    if [ "$OS" = "linux" ]; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo -e "${GREEN}✅ Docker Compose installed${NC}"
    fi
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

echo -e "${YELLOW}[3/10] Checking Node.js...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"

    if [ "$OS" = "linux" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ "$OS" = "macos" ]; then
        brew install node
    fi

    echo -e "${GREEN}✅ Node.js installed${NC}"
else
    echo -e "${GREEN}✅ Node.js already installed ($(node -v))${NC}"
fi

echo -e "${YELLOW}[4/10] Checking Make...${NC}"

if ! command -v make &> /dev/null; then
    echo -e "${YELLOW}Make not found. Installing...${NC}"

    if [ "$OS" = "linux" ]; then
        sudo apt-get install -y build-essential
    elif [ "$OS" = "macos" ]; then
        xcode-select --install
    fi

    echo -e "${GREEN}✅ Make installed${NC}"
else
    echo -e "${GREEN}✅ Make already installed${NC}"
fi

echo -e "${YELLOW}[5/10] Setting up Hero Infra...${NC}"

INSTALL_DIR="${HOME}/hero-infra"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}⚠️  Hero Infra already exists at $INSTALL_DIR${NC}"
    read -p "Remove and reinstall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
    else
        echo -e "${BLUE}Using existing installation${NC}"
        cd "$INSTALL_DIR"
    fi
fi

if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}Creating directory: $INSTALL_DIR${NC}"
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"

    # Initialize git (if this is a new repo)
    git init
    echo -e "${GREEN}✅ Directory created${NC}"
fi

echo -e "${YELLOW}[6/10] Creating directory structure...${NC}"

mkdir -p {frontend,backend,nginx/ssl,mysql/init,scripts,logs/{frontend,backend,nginx,mysql},backups,monitoring/{prometheus,grafana,alertmanager,loki},dashboard/api,tools/visual-builder}

echo -e "${GREEN}✅ Directory structure created${NC}"

echo -e "${YELLOW}[7/10] Installing dashboard dependencies...${NC}"

cd dashboard/api

cat > package.json << 'EOF'
{
  "name": "hero-dashboard",
  "version": "2.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "chokidar": "^3.5.3"
  }
}
EOF

npm install --silent
echo -e "${GREEN}✅ Dashboard dependencies installed${NC}"

cd ../..

echo -e "${YELLOW}[8/10] Generating configuration files...${NC}"

# Generate random passwords
MYSQL_PASS=$(openssl rand -base64 32)
DB_PASS=$(openssl rand -base64 32)
REDIS_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

cat > .env << EOF
# Hero Infra Configuration
# Generated: $(date)

# Database
MYSQL_ROOT_PASSWORD=$MYSQL_PASS
DB_PASSWORD=$DB_PASS
DB_NAME=hero
DB_USER=hero_user

# Redis
REDIS_PASSWORD=$REDIS_PASS

# Application
NODE_ENV=development
JWT_SECRET=$JWT_SECRET

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin

# Auto-generated - Keep secure!
EOF

echo -e "${GREEN}✅ Configuration files generated${NC}"
echo -e "${YELLOW}⚠️  Credentials saved in .env (keep it secret!)${NC}"

echo -e "${YELLOW}[9/10] Creating example projects...${NC}"

# Frontend example
cat > frontend/package.json << 'EOF'
{
  "name": "hero-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "echo 'Frontend running on port 3000' && sleep infinity",
    "build": "echo 'Building frontend...'"
  }
}
EOF

# Backend example
cat > backend/main.go << 'EOF'
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "OK")
    })

    fmt.Println("Backend running on :8080")
    http.ListenAndServe(":8080", nil)
}
EOF

cat > backend/go.mod << 'EOF'
module hero-backend

go 1.21
EOF

echo -e "${GREEN}✅ Example projects created${NC}"

echo -e "${YELLOW}[10/10] Finalizing installation...${NC}"

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

# Add to PATH (optional)
SHELL_RC="${HOME}/.bashrc"
if [ "$OS" = "macos" ]; then
    SHELL_RC="${HOME}/.zshrc"
fi

if ! grep -q "hero-infra" "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# Hero Infra" >> "$SHELL_RC"
    echo "alias hero='cd $INSTALL_DIR && make'" >> "$SHELL_RC"
    echo -e "${GREEN}✅ Added 'hero' alias to $SHELL_RC${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║          🎉 Installation Complete! 🎉                 ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Installation directory: ${NC}$INSTALL_DIR"
echo ""
echo -e "${YELLOW}🚀 Quick Start:${NC}"
echo ""
echo -e "  1. ${BLUE}cd $INSTALL_DIR${NC}"
echo -e "  2. ${BLUE}make setup${NC}              # Configure environment"
echo -e "  3. ${BLUE}make all${NC}                # Start everything"
echo ""
echo -e "${YELLOW}📚 Available Commands:${NC}"
echo ""
echo -e "  ${GREEN}make dev${NC}                 # Development environment"
echo -e "  ${GREEN}make dashboard${NC}           # Web UI + Auto-sync"
echo -e "  ${GREEN}make monitoring${NC}          # Prometheus + Grafana"
echo -e "  ${GREEN}make visual-builder${NC}      # Drag & drop builder"
echo -e "  ${GREEN}make help${NC}                # See all commands"
echo ""
echo -e "${YELLOW}🌐 Access URLs:${NC}"
echo ""
echo -e "  Dashboard:      ${CYAN}http://localhost:5000${NC}"
echo -e "  Visual Builder: ${CYAN}http://localhost:7000${NC}"
echo -e "  Grafana:        ${CYAN}http://localhost:3001${NC}"
echo -e "  Application:    ${CYAN}http://localhost${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo ""
echo -e "  • Run ${BLUE}'hero help'${NC} anywhere to see commands"
echo -e "  • Add your frontend/backend repos to respective folders"
echo -e "  • Edit .env file to customize settings"
echo -e "  • Check documentation: ${CYAN}README.md${NC}"
echo ""
echo -e "${PURPLE}⭐ Star us on GitHub!${NC}"
echo -e "${PURPLE}🤝 Join our community!${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
