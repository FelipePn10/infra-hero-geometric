#!/usr/bin/env node

const chokidar = require("chokidar");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const log = (msg, color = "reset") => {
  console.log(`${colors[color]}${msg}${colors.reset}`);
};

const execCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// ========================================
// Configuration
// ========================================
const config = {
  frontend: {
    path: "./frontend",
    container: "hero-frontend",
    hotReload: true,
    ignore: ["node_modules/**", "dist/**", "build/**", ".next/**"],
    onChange: async (file) => {
      log(`📝 Frontend file changed: ${file}`, "cyan");
      if (config.frontend.hotReload) {
        log("🔥 Hot reload enabled - no action needed", "green");
      }
    },
  },
  backend: {
    path: "./backend",
    container: "hero-backend",
    hotReload: true,
    ignore: ["node_modules/**", "vendor/**", "tmp/**"],
    onChange: async (file) => {
      log(`📝 Backend file changed: ${file}`, "cyan");
      if (file.endsWith(".go")) {
        log("🔄 Rebuilding Go application...", "yellow");
        try {
          await execCommand(
            `docker exec ${config.backend.container} go build -o main .`,
          );
          log("✅ Go application rebuilt", "green");
        } catch (error) {
          log(`❌ Build failed: ${error.error}`, "red");
        }
      }
    },
  },
  migrations: {
    path: "./backend/migrations",
    container: "hero-backend",
    onChange: async (file) => {
      log(`🗄️  Migration file detected: ${file}`, "cyan");
      await handleMigration(file);
    },
  },
  nginx: {
    path: "./nginx",
    container: "hero-nginx",
    onChange: async (file) => {
      log(`⚙️  Nginx config changed: ${file}`, "cyan");
      log("🔄 Validating and reloading nginx...", "yellow");
      try {
        await execCommand(`docker exec ${config.nginx.container} nginx -t`);
        await execCommand(
          `docker exec ${config.nginx.container} nginx -s reload`,
        );
        log("✅ Nginx reloaded successfully", "green");
      } catch (error) {
        log(`❌ Nginx reload failed: ${error.error}`, "red");
      }
    },
  },
};

// ========================================
// Migration Handler
// ========================================
async function handleMigration(file) {
  const filename = path.basename(file);

  // Check if it's a new migration
  if (!filename.match(/^\d{14}_.*\.(sql|js)$/)) {
    log("⚠️  Invalid migration filename format", "yellow");
    return;
  }

  log("🚀 Running migration...", "yellow");

  try {
    const ext = path.extname(file);

    if (ext === ".sql") {
      // SQL migration
      await execCommand(
        `docker exec -i hero-mysql mysql -uroot -proot hero < ${file}`,
      );
    } else if (ext === ".js") {
      // JavaScript migration (for MongoDB, etc)
      await execCommand(`docker exec ${config.backend.container} node ${file}`);
    }

    log("✅ Migration completed successfully", "green");

    // Log migration to track
    await logMigration(filename);
  } catch (error) {
    log(`❌ Migration failed: ${error.error}`, "red");
  }
}

async function logMigration(filename) {
  const logFile = "./migrations_log.json";
  let migrations = [];

  if (fs.existsSync(logFile)) {
    migrations = JSON.parse(fs.readFileSync(logFile, "utf8"));
  }

  migrations.push({
    file: filename,
    timestamp: new Date().toISOString(),
    status: "completed",
  });

  fs.writeFileSync(logFile, JSON.stringify(migrations, null, 2));
}

// ========================================
// File Sync Handler
// ========================================
async function syncFile(file, containerPath, container) {
  try {
    const relativePath = path.relative(process.cwd(), file);
    const targetPath = `${containerPath}/${relativePath}`;

    await execCommand(`docker cp ${file} ${container}:${targetPath}`);

    log(`📤 Synced: ${relativePath} → ${container}`, "green");
  } catch (error) {
    log(`❌ Sync failed: ${error.error}`, "red");
  }
}

// ========================================
// Bi-directional Sync
// ========================================
async function setupBidirectionalSync(localPath, containerPath, container) {
  // Local to Container
  const watcher = chokidar.watch(localPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", async (file) => {
    await syncFile(file, containerPath, container);
  });

  // Container to Local (polling every 5 seconds)
  setInterval(async () => {
    try {
      const { stdout } = await execCommand(
        `docker exec ${container} find ${containerPath} -type f -mmin -0.1`,
      );

      const changedFiles = stdout
        .trim()
        .split("\n")
        .filter((f) => f);

      for (const file of changedFiles) {
        const localFile = file.replace(containerPath, localPath);
        await execCommand(`docker cp ${container}:${file} ${localFile}`);
        log(`📥 Synced from container: ${file}`, "blue");
      }
    } catch (error) {
      // Ignore errors (container might not be running)
    }
  }, 5000);
}

// ========================================
// Smart Rebuild Detection
// ========================================
const rebuildQueue = new Map();

function scheduleRebuild(service, delay = 2000) {
  if (rebuildQueue.has(service)) {
    clearTimeout(rebuildQueue.get(service));
  }

  const timeout = setTimeout(async () => {
    log(`🔄 Triggering rebuild for ${service}...`, "yellow");
    try {
      await execCommand(`docker compose restart ${service}`);
      log(`✅ ${service} restarted`, "green");
    } catch (error) {
      log(`❌ Restart failed: ${error.error}`, "red");
    }
    rebuildQueue.delete(service);
  }, delay);

  rebuildQueue.set(service, timeout);
}

// ========================================
// Dependency Change Detection
// ========================================
async function checkDependencies(file) {
  const filename = path.basename(file);

  // package.json changed
  if (filename === "package.json") {
    log("📦 package.json changed - installing dependencies...", "yellow");
    const service = file.includes("frontend") ? "frontend" : "backend";
    try {
      await execCommand(`docker exec hero-${service} npm install`);
      log("✅ Dependencies installed", "green");
      scheduleRebuild(service);
    } catch (error) {
      log(`❌ Dependency installation failed: ${error.error}`, "red");
    }
  }

  // go.mod changed
  if (filename === "go.mod") {
    log("📦 go.mod changed - downloading dependencies...", "yellow");
    try {
      await execCommand(`docker exec hero-backend go mod download`);
      log("✅ Go dependencies downloaded", "green");
      scheduleRebuild("backend");
    } catch (error) {
      log(`❌ Go mod download failed: ${error.error}`, "red");
    }
  }

  // Dockerfile changed
  if (filename.startsWith("Dockerfile")) {
    log("🐳 Dockerfile changed - rebuild required", "yellow");
    const service = file.includes("frontend") ? "frontend" : "backend";
    log(`⚠️  Run: docker compose build ${service}`, "yellow");
  }
}

// ========================================
// Environment Variable Hot Reload
// ========================================
async function reloadEnvVars() {
  log("🔄 Reloading environment variables...", "yellow");
  try {
    await execCommand("docker compose up -d --force-recreate");
    log("✅ Environment variables reloaded", "green");
  } catch (error) {
    log(`❌ Reload failed: ${error.error}`, "red");
  }
}

// ========================================
// Main Watchers Setup
// ========================================
function setupWatchers() {
  log("🚀 Starting Auto-Sync System...", "cyan");
  log("━".repeat(60), "cyan");

  // Frontend watcher
  if (fs.existsSync(config.frontend.path)) {
    const frontendWatcher = chokidar.watch(config.frontend.path, {
      ignored: config.frontend.ignore,
      persistent: true,
      ignoreInitial: true,
    });

    frontendWatcher.on("change", config.frontend.onChange);
    frontendWatcher.on("change", checkDependencies);
    log(`✅ Watching: ${config.frontend.path}`, "green");
  }

  // Backend watcher
  if (fs.existsSync(config.backend.path)) {
    const backendWatcher = chokidar.watch(config.backend.path, {
      ignored: config.backend.ignore,
      persistent: true,
      ignoreInitial: true,
    });

    backendWatcher.on("change", config.backend.onChange);
    backendWatcher.on("change", checkDependencies);
    log(`✅ Watching: ${config.backend.path}`, "green");
  }

  // Migrations watcher
  if (fs.existsSync(config.migrations.path)) {
    const migrationsWatcher = chokidar.watch(config.migrations.path, {
      persistent: true,
      ignoreInitial: false,
    });

    migrationsWatcher.on("add", config.migrations.onChange);
    log(`✅ Watching migrations: ${config.migrations.path}`, "green");
  }

  // Nginx watcher
  if (fs.existsSync(config.nginx.path)) {
    const nginxWatcher = chokidar.watch(config.nginx.path, {
      persistent: true,
      ignoreInitial: true,
    });

    nginxWatcher.on("change", config.nginx.onChange);
    log(`✅ Watching Nginx: ${config.nginx.path}`, "green");
  }

  // .env watcher
  if (fs.existsSync(".env")) {
    const envWatcher = chokidar.watch(".env", {
      persistent: true,
      ignoreInitial: true,
    });

    envWatcher.on("change", () => {
      log("⚙️  .env file changed", "cyan");
      reloadEnvVars();
    });
    log("✅ Watching: .env", "green");
  }

  log("━".repeat(60), "cyan");
  log("👀 Watching for changes... (Press Ctrl+C to stop)", "cyan");
  log("");
}

// ========================================
// Health Monitor
// ========================================
async function monitorHealth() {
  setInterval(async () => {
    try {
      const { stdout } = await execCommand(
        'docker ps --filter "name=hero-" --format "{{.Names}}: {{.Status}}"',
      );
      const services = stdout.trim().split("\n");

      for (const service of services) {
        if (service.includes("unhealthy") || service.includes("Restarting")) {
          log(`⚠️  ${service}`, "red");
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }, 30000); // Check every 30 seconds
}

// ========================================
// Start Everything
// ========================================
setupWatchers();
monitorHealth();

// Graceful shutdown
process.on("SIGINT", () => {
  log("\n👋 Shutting down Auto-Sync...", "yellow");
  process.exit(0);
});
