#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           HERO INFRA - Test Suite                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# Helper Functions
# ========================================
test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

# ========================================
# 1. Docker Compose Validation
# ========================================
echo -e "${YELLOW}[1/10] Validating Docker Compose files...${NC}"

if docker compose -f docker-compose.yml config > /dev/null 2>&1; then
    test_passed "docker-compose.yml is valid"
else
    test_failed "docker-compose.yml is invalid"
fi

if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    test_passed "docker-compose.prod.yml is valid"
else
    test_failed "docker-compose.prod.yml is invalid"
fi

if docker compose -f docker-compose.staging.yml config > /dev/null 2>&1; then
    test_passed "docker-compose.staging.yml is valid"
else
    test_failed "docker-compose.staging.yml is invalid"
fi

if docker compose -f docker-compose.monitoring.yml config > /dev/null 2>&1; then
    test_passed "docker-compose.monitoring.yml is valid"
else
    test_failed "docker-compose.monitoring.yml is invalid"
fi

# ========================================
# 2. Nginx Configuration Validation
# ========================================
echo -e "${YELLOW}[2/10] Validating Nginx configurations...${NC}"

if docker run --rm -v $(pwd)/nginx:/etc/nginx:ro nginx:alpine nginx -t > /dev/null 2>&1; then
    test_passed "Nginx configs are valid"
else
    test_failed "Nginx configs are invalid"
fi

# ========================================
# 3. Shell Scripts Validation
# ========================================
echo -e "${YELLOW}[3/10] Validating shell scripts...${NC}"

SCRIPT_ERRORS=0
for script in scripts/*.sh; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            test_passed "$(basename $script) syntax is valid"
        else
            test_failed "$(basename $script) has syntax errors"
            SCRIPT_ERRORS=$((SCRIPT_ERRORS + 1))
        fi
    fi
done

# ========================================
# 4. Required Files Check
# ========================================
echo -e "${YELLOW}[4/10] Checking required files...${NC}"

REQUIRED_FILES=(
    "docker-compose.yml"
    "docker-compose.prod.yml"
    "Makefile"
    "nginx/nginx.conf"
    "nginx/nginx.prod.conf"
    "scripts/setup.sh"
    "scripts/start.sh"
    "scripts/backup.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_passed "$file exists"
    else
        test_failed "$file is missing"
    fi
done

# ========================================
# 5. Directory Structure Check
# ========================================
echo -e "${YELLOW}[5/10] Checking directory structure...${NC}"

REQUIRED_DIRS=(
    "logs"
    "nginx"
    "scripts"
    "backups"
    "monitoring"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        test_passed "$dir/ directory exists"
    else
        test_failed "$dir/ directory is missing"
    fi
done

# ========================================
# 6. Docker Availability
# ========================================
echo -e "${YELLOW}[6/10] Checking Docker availability...${NC}"

if command -v docker &> /dev/null; then
    test_passed "Docker is installed"

    if docker info &> /dev/null; then
        test_passed "Docker daemon is running"
    else
        test_failed "Docker daemon is not running"
    fi
else
    test_failed "Docker is not installed"
fi

if command -v docker compose &> /dev/null; then
    test_passed "Docker Compose is installed"
else
    test_failed "Docker Compose is not installed"
fi

# ========================================
# 7. Port Availability (if not running)
# ========================================
echo -e "${YELLOW}[7/10] Checking port availability...${NC}"

PORTS=(80 443 3000 8080 3306 6379 9090 3001)

for port in "${PORTS[@]}"; do
    if ! lsof -i :$port > /dev/null 2>&1; then
        test_passed "Port $port is available"
    else
        # Port in use - check if it's our containers
        if docker ps | grep -q ":$port->"; then
            test_passed "Port $port is used by hero containers"
        else
            test_failed "Port $port is in use by another process"
        fi
    fi
done

# ========================================
# 8. Environment Variables Check
# ========================================
echo -e "${YELLOW}[8/10] Checking environment variables...${NC}"

if [ -f ".env" ]; then
    test_passed ".env file exists"

    REQUIRED_VARS=(
        "MYSQL_ROOT_PASSWORD"
        "DB_PASSWORD"
        "DB_NAME"
        "REDIS_PASSWORD"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            test_passed "$var is defined in .env"
        else
            test_failed "$var is missing in .env"
        fi
    done
else
    test_failed ".env file is missing"
fi

# ========================================
# 9. Services Health Check (if running)
# ========================================
echo -e "${YELLOW}[9/10] Checking running services health...${NC}"

if docker ps | grep -q "hero-"; then
    # Frontend
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        test_passed "Frontend is responding"
    else
        test_failed "Frontend is not responding"
    fi

    # Backend
    if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
        test_passed "Backend is responding"
    else
        test_failed "Backend is not responding"
    fi

    # Nginx
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        test_passed "Nginx is responding"
    else
        test_failed "Nginx is not responding"
    fi

    # MySQL
    if docker exec hero-mysql mysqladmin ping -h localhost -uroot -p$(grep MYSQL_ROOT_PASSWORD .env | cut -d'=' -f2) > /dev/null 2>&1; then
        test_passed "MySQL is responding"
    else
        test_failed "MySQL is not responding"
    fi

    # Redis
    if docker exec hero-redis redis-cli -a $(grep REDIS_PASSWORD .env | cut -d'=' -f2) ping > /dev/null 2>&1; then
        test_passed "Redis is responding"
    else
        test_failed "Redis is not responding"
    fi
else
    echo -e "${BLUE}ℹ️  No services running - skipping health checks${NC}"
fi

# ========================================
# 10. Integration Tests
# ========================================
echo -e "${YELLOW}[10/10] Running integration tests...${NC}"

if docker ps | grep -q "hero-"; then
    # Test database connection from backend
    if docker exec hero-backend sh -c "nc -z mysql 3306" > /dev/null 2>&1; then
        test_passed "Backend can reach MySQL"
    else
        test_failed "Backend cannot reach MySQL"
    fi

    # Test Redis connection from backend
    if docker exec hero-backend sh -c "nc -z redis 6379" > /dev/null 2>&1; then
        test_passed "Backend can reach Redis"
    else
        test_failed "Backend cannot reach Redis"
    fi

    # Test proxy routing
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        test_passed "Nginx proxy to backend works"
    else
        test_failed "Nginx proxy to backend fails"
    fi
else
    echo -e "${BLUE}ℹ️  No services running - skipping integration tests${NC}"
fi

# ========================================
# Results Summary
# ========================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Test Results Summary                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED/$TOTAL_TESTS)*100}")

echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           🎉 All Tests Passed! 🎉                         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ⚠️  Some Tests Failed                           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
