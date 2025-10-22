import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";
import {
  SystemStats,
  ContainerStatus,
  Snapshot,
  Backup,
  CommandRequest,
  CommandResponse,
  AIQuery,
  AIResponse,
  ServiceInstallRequest,
  HealthCheck,
  ApiError,
  ValidationError,
  SystemStatsSchema,
  ContainerStatusSchema,
  SnapshotSchema,
  BackupSchema,
  CommandResponseSchema,
  AIResponseSchema,
  HealthCheckSchema,
} from "../types";

// ========================================
// API Configuration
// ========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_TIMEOUT = 30000;

// ========================================
// Axios Instance
// ========================================
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // Server responded with error
        throw new ApiError(
          error.response.data?.message || error.message,
          error.response.status,
          error.response.data?.code,
        );
      } else if (error.request) {
        // Request made but no response
        throw new ApiError("Network error - no response from server", 503);
      } else {
        // Something else happened
        throw new ApiError(error.message, 500);
      }
    },
  );

  return instance;
};

const apiClient = createApiClient();

// ========================================
// Validation Helper
// ========================================
const validateResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Response validation failed", error);
    }
    throw error;
  }
};

// ========================================
// API Methods
// ========================================

export const api = {
  // ========================================
  // System & Overview
  // ========================================
  async getOverview(): Promise<SystemStats> {
    const { data } = await apiClient.get("/api/overview");
    return validateResponse(SystemStatsSchema, data);
  },

  async getServices(): Promise<ContainerStatus[]> {
    const { data } = await apiClient.get("/api/services");
    return validateResponse(z.array(ContainerStatusSchema), data);
  },

  async getHealth(): Promise<HealthCheck[]> {
    const { data } = await apiClient.get("/api/health");
    return validateResponse(z.array(HealthCheckSchema), data);
  },

  // ========================================
  // Service Management
  // ========================================
  async startServices(environment: string = "dev"): Promise<void> {
    await apiClient.post("/api/start", { environment });
  },

  async stopServices(environment: string = "dev"): Promise<void> {
    await apiClient.post("/api/stop", { environment });
  },

  async restartServices(environment: string = "dev"): Promise<void> {
    await apiClient.post("/api/restart", { environment });
  },

  async restartService(serviceName: string): Promise<void> {
    await apiClient.post(`/api/service/${serviceName}/restart`);
  },

  async installService(request: ServiceInstallRequest): Promise<void> {
    await apiClient.post("/api/services/install", request);
  },

  // ========================================
  // Logs
  // ========================================
  async getLogs(service: string, lines: number = 100): Promise<string> {
    const { data } = await apiClient.get(`/api/logs/${service}`, {
      params: { lines },
    });
    return data.logs;
  },

  // ========================================
  // Backups
  // ========================================
  async createBackup(): Promise<{ file: string }> {
    const { data } = await apiClient.post("/api/backup");
    return data;
  },

  async listBackups(): Promise<Backup[]> {
    const { data } = await apiClient.get("/api/backups");
    return validateResponse(z.array(BackupSchema), data);
  },

  async restoreBackup(filename: string): Promise<void> {
    await apiClient.post(`/api/backup/${filename}/restore`);
  },

  // ========================================
  // Snapshots
  // ========================================
  async createSnapshot(
    name: string,
    description: string,
  ): Promise<{ snapshot: string }> {
    const { data } = await apiClient.post("/api/snapshot", {
      name,
      description,
    });
    return data;
  },

  async listSnapshots(): Promise<Snapshot[]> {
    const { data } = await apiClient.get("/api/snapshots");
    return validateResponse(z.array(SnapshotSchema), data);
  },

  async restoreSnapshot(name: string): Promise<void> {
    await apiClient.post(`/api/snapshot/${name}/restore`);
  },

  async deleteSnapshot(name: string): Promise<void> {
    await apiClient.delete(`/api/snapshot/${name}`);
  },

  // ========================================
  // Commands
  // ========================================
  async executeCommand(request: CommandRequest): Promise<CommandResponse> {
    const { data } = await apiClient.post("/api/exec", request);
    return validateResponse(CommandResponseSchema, data);
  },

  // ========================================
  // AI Assistant
  // ========================================
  async askAI(query: AIQuery): Promise<AIResponse> {
    const { data } = await apiClient.post("/api/ai/analyze", query);
    return validateResponse(AIResponseSchema, data);
  },

  // ========================================
  // Environment Variables
  // ========================================
  async getEnvVars(): Promise<Array<{ key: string; value: string }>> {
    const { data } = await apiClient.get("/api/env");
    return data;
  },

  async updateEnvVar(key: string, value: string): Promise<void> {
    await apiClient.put(`/api/env/${key}`, { value });
  },

  // ========================================
  // Docker Compose
  // ========================================
  async getComposeConfig(environment: string): Promise<string> {
    const { data } = await apiClient.get(`/api/compose/${environment}`);
    return data.config;
  },
};

// ========================================
// WebSocket Connection
// ========================================
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private url: string = "ws://localhost:5000") {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.emit("connected", null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.emit("disconnected", null);
        this.reconnect();
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.emit("max_reconnect", null);
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// ========================================
// React Query Helpers
// ========================================
export const queryKeys = {
  overview: ["overview"] as const,
  services: ["services"] as const,
  health: ["health"] as const,
  logs: (service: string) => ["logs", service] as const,
  backups: ["backups"] as const,
  snapshots: ["snapshots"] as const,
  envVars: ["envVars"] as const,
  composeConfig: (env: string) => ["composeConfig", env] as const,
};

// ========================================
// Export configured client
// ========================================
export default api;
