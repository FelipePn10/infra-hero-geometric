import { z } from "zod";

export const ServiceNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  icon: z.string(),
  image: z.string(),
  ports: z.array(z.string()).default([]),
  environment: z.array(z.string()).default([]),
  volumes: z.array(z.string()).default([]),
  networks: z.array(z.string()).default(["hero-network"]),
  depends_on: z.array(z.string()).default([]),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  restart: z
    .enum(["no", "always", "on-failure", "unless-stopped"])
    .default("unless-stopped"),
  healthcheck: z
    .object({
      test: z.string(),
      interval: z.string().default("30s"),
      timeout: z.string().default("10s"),
      retries: z.number().default(3),
    })
    .optional(),
  status: z.enum(["running", "stopped", "pending", "error"]).optional(),
  config: z.record(z.any()).optional(),
});

export type ServiceNode = z.infer<typeof ServiceNodeSchema>;

export const ServiceTemplateSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
  image: z.string(),
  ports: z.array(z.string()).optional(),
  environment: z.array(z.string()).optional(),
  volumes: z.array(z.string()).optional(),
  category: z.enum([
    "frontend",
    "backend",
    "database",
    "cache",
    "messaging",
    "monitoring",
    "tools",
  ]),
  tags: z.array(z.string()).default([]),
});

export type ServiceTemplate = z.infer<typeof ServiceTemplateSchema>;

export interface DockerComposeService {
  image: string;
  container_name?: string;
  ports?: string[];
  environment?: string[];
  volumes?: string[];
  networks?: string[];
  depends_on?: string[];
  restart?: string;
  healthcheck?: {
    test: string | string[];
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };
  labels?: Record<string, string>;
}

export interface DockerComposeConfig {
  version: string;
  services: Record<string, DockerComposeService>;
  networks?: Record<
    string,
    {
      driver: string;
      name?: string;
    }
  >;
  volumes?: Record<
    string,
    {
      driver: string;
    }
  >;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  type: "network" | "depends_on" | "volume";
}

export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  gridVisible: boolean;
  snapToGrid: boolean;
}

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  nodes: z.array(ServiceNodeSchema),
  connections: z
    .array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        type: z.enum(["network", "depends_on", "volume"]),
      }),
    )
    .default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ExportOptions {
  format: "yaml" | "json";
  includeComments: boolean;
  minify: boolean;
}

export interface ImportResult {
  success: boolean;
  nodes: ServiceNode[];
  errors: ValidationError[];
}

export interface CommandRequest {
  command: string;
  container?: string;
  workingDir?: string;
  environment?: Record<string, string>;
}

export interface CommandResponse {
  output: string;
  error?: string;
  exitCode: number;
  timestamp: string;
  duration: number;
}
