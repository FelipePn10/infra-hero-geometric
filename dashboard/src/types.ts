export type Environment = "dev" | "staging" | "prod";

export interface Service {
  id: string;
  name: string;
  type: string;
  status: "running" | "stopped" | "pending" | "error";
  environment: Environment;
  cpu: number;
  memory: number;
  uptime: string;
  version: string;
  lastDeployed: string;
}

export interface OverviewStats {
  totalServices: number;
  runningServices: number;
  totalCPU: number;
  totalMemory: number;
  healthyServices: number;
  lastUpdated: string;
}

export interface Metric {
  timestamp: string;
  serviceId: string;
  cpu: number;
  memory: number;
  requests: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  serviceId: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  environment: Environment;
}

// Terminal and Command Types
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

export interface TerminalSession {
  id: string;
  createdAt: string;
  lastActivity: string;
  container?: string;
  environment: Environment;
  commandHistory: string[];
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  ports: string[];
  networks: string[];
}

// Service Template Types (se necessário para o terminal)
export interface ServiceTemplate {
  id: string;
  type: string;
  name: string;
  icon: string;
  description: string;
  image: string;
  ports: string[];
  environment: string[];
  volumes: string[];
  category: string;
  tags: string[];
}

export interface ServiceNode {
  id: string;
  type: string;
  name: string;
  icon?: string;
  image: string;
  ports: string[];
  environment: string[];
  volumes: string[];
  position: { x: number; y: number };
  config?: Record<string, any>;
  status?: "running" | "stopped" | "pending";
}
