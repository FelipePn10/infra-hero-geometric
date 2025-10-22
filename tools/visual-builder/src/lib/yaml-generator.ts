import {
  ServiceNode,
  DockerComposeConfig,
  DockerComposeService,
  ValidationError,
} from "../types";

export function validateNodes(nodes: ServiceNode[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for duplicate names
  const names = nodes.map((n) => n.name);
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index,
  );

  if (duplicates.length > 0) {
    errors.push({
      field: "services",
      message: `Duplicate service names: ${duplicates.join(", ")}`,
      severity: "error",
    });
  }

  // Check for port conflicts
  const portMap = new Map<string, string[]>();
  nodes.forEach((node) => {
    node.ports.forEach((port) => {
      const hostPort = port.split(":")[0];
      if (!portMap.has(hostPort)) {
        portMap.set(hostPort, []);
      }
      portMap.get(hostPort)!.push(node.name);
    });
  });

  portMap.forEach((services, port) => {
    if (services.length > 1) {
      errors.push({
        field: "ports",
        message: `Port ${port} is used by multiple services: ${services.join(", ")}`,
        severity: "error",
      });
    }
  });

  // Check for circular dependencies
  const checkCircular = (
    nodeId: string,
    visited: Set<string> = new Set(),
  ): boolean => {
    if (visited.has(nodeId)) return true;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return false;

    return node.depends_on.some((dep) => {
      const depNode = nodes.find((n) => n.name === dep);
      return depNode && checkCircular(depNode.id, new Set(visited));
    });
  };

  nodes.forEach((node) => {
    if (checkCircular(node.id)) {
      errors.push({
        field: "depends_on",
        message: `Circular dependency detected for service: ${node.name}`,
        severity: "error",
      });
    }
  });

  // Warnings
  nodes.forEach((node) => {
    if (node.ports.length === 0 && node.type !== "database") {
      errors.push({
        field: "ports",
        message: `Service ${node.name} has no ports exposed`,
        severity: "warning",
      });
    }

    if (
      node.environment.length === 0 &&
      ["database", "cache"].includes(node.type)
    ) {
      errors.push({
        field: "environment",
        message: `Service ${node.name} should have environment variables`,
        severity: "warning",
      });
    }
  });

  return errors;
}

// YAML Generation
export function generateYAML(
  nodes: ServiceNode[],
  validate: boolean = true,
): string {
  if (validate) {
    const errors = validateNodes(nodes);
    const criticalErrors = errors.filter((e) => e.severity === "error");

    if (criticalErrors.length > 0) {
      throw new Error(
        `Validation failed:\n${criticalErrors.map((e) => `- ${e.message}`).join("\n")}`,
      );
    }
  }

  const config: DockerComposeConfig = {
    version: "3.8",
    services: {},
    networks: {
      "hero-network": {
        driver: "bridge",
        name: "hero-network",
      },
    },
    volumes: {},
  };

  // Convert nodes to services
  nodes.forEach((node) => {
    const service: DockerComposeService = {
      image: node.image,
      container_name: `hero-${node.type}`,
    };

    if (node.ports.length > 0) {
      service.ports = node.ports;
    }

    if (node.environment.length > 0) {
      service.environment = node.environment;
    }

    if (node.volumes.length > 0) {
      service.volumes = node.volumes;

      // Extract named volumes
      node.volumes.forEach((vol) => {
        const parts = vol.split(":");
        if (
          parts.length > 1 &&
          !parts[0].startsWith(".") &&
          !parts[0].startsWith("/")
        ) {
          const volumeName = parts[0];
          if (!config.volumes![volumeName]) {
            config.volumes![volumeName] = { driver: "local" };
          }
        }
      });
    }

    if (node.networks.length > 0) {
      service.networks = node.networks;
    }

    if (node.depends_on.length > 0) {
      service.depends_on = node.depends_on;
    }

    if (node.restart) {
      service.restart = node.restart;
    }

    if (node.healthcheck) {
      service.healthcheck = {
        test: Array.isArray(node.healthcheck.test)
          ? node.healthcheck.test
          : node.healthcheck.test.split(" "),
        interval: node.healthcheck.interval,
        timeout: node.healthcheck.timeout,
        retries: node.healthcheck.retries,
      };
    }

    // Add labels
    service.labels = {
      "com.hero.service": node.type,
      "com.hero.managed": "visual-builder",
    };

    config.services[node.type] = service;
  });

  return convertToYAML(config);
}

// YAML Conversion (Manual for better formatting)
function convertToYAML(config: DockerComposeConfig): string {
  let yaml = `version: '${config.version}'\n\n`;
  yaml += "services:\n";

  // Services
  Object.entries(config.services).forEach(([name, service]) => {
    yaml += `  ${name}:\n`;
    yaml += `    image: ${service.image}\n`;

    if (service.container_name) {
      yaml += `    container_name: ${service.container_name}\n`;
    }

    if (service.ports && service.ports.length > 0) {
      yaml += "    ports:\n";
      service.ports.forEach((port) => {
        yaml += `      - "${port}"\n`;
      });
    }

    if (service.environment && service.environment.length > 0) {
      yaml += "    environment:\n";
      service.environment.forEach((env) => {
        yaml += `      - ${env}\n`;
      });
    }

    if (service.volumes && service.volumes.length > 0) {
      yaml += "    volumes:\n";
      service.volumes.forEach((vol) => {
        yaml += `      - ${vol}\n`;
      });
    }

    if (service.networks && service.networks.length > 0) {
      yaml += "    networks:\n";
      service.networks.forEach((net) => {
        yaml += `      - ${net}\n`;
      });
    }

    if (service.depends_on && service.depends_on.length > 0) {
      yaml += "    depends_on:\n";
      service.depends_on.forEach((dep) => {
        yaml += `      - ${dep}\n`;
      });
    }

    if (service.restart) {
      yaml += `    restart: ${service.restart}\n`;
    }

    if (service.healthcheck) {
      yaml += "    healthcheck:\n";
      yaml += `      test: ${JSON.stringify(service.healthcheck.test)}\n`;
      if (service.healthcheck.interval) {
        yaml += `      interval: ${service.healthcheck.interval}\n`;
      }
      if (service.healthcheck.timeout) {
        yaml += `      timeout: ${service.healthcheck.timeout}\n`;
      }
      if (service.healthcheck.retries) {
        yaml += `      retries: ${service.healthcheck.retries}\n`;
      }
    }

    if (service.labels) {
      yaml += "    labels:\n";
      Object.entries(service.labels).forEach(([key, value]) => {
        yaml += `      - "${key}=${value}"\n`;
      });
    }

    yaml += "\n";
  });

  // Networks
  if (config.networks && Object.keys(config.networks).length > 0) {
    yaml += "networks:\n";
    Object.entries(config.networks).forEach(([name, network]) => {
      yaml += `  ${name}:\n`;
      yaml += `    driver: ${network.driver}\n`;
      if (network.name) {
        yaml += `    name: ${network.name}\n`;
      }
    });
    yaml += "\n";
  }

  // Volumes
  if (config.volumes && Object.keys(config.volumes).length > 0) {
    yaml += "volumes:\n";
    Object.entries(config.volumes).forEach(([name, volume]) => {
      yaml += `  ${name}:\n`;
      yaml += `    driver: ${volume.driver}\n`;
    });
  }

  return yaml;
}

// Import from YAML (Future feature)
export function parseYAML(yamlString: string): ServiceNode[] {
  // TODO: Implement YAML parsing
  // This would convert docker-compose.yml back to ServiceNodes
  throw new Error("YAML parsing not yet implemented");
}

// Export to JSON
export function generateJSON(nodes: ServiceNode[]): string {
  const config = {
    version: "3.8",
    services: {},
  };

  nodes.forEach((node) => {
    config.services[node.type] = {
      image: node.image,
      container_name: `hero-${node.type}`,
      ports: node.ports,
      environment: node.environment,
      volumes: node.volumes,
      networks: node.networks,
    };
  });

  return JSON.stringify(config, null, 2);
}
