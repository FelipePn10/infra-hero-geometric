FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    docker-cli \
    docker-cli-compose \
    curl \
    bash \
    git

# Copy package files
COPY api/package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p /app/backups /app/logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "api/server.js"]
