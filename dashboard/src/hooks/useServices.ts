import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api, { queryKeys } from "../lib/api";
import type {
  SystemStats,
  ContainerStatus,
  Snapshot,
  Backup,
  CommandRequest,
  AIQuery,
  ServiceInstallRequest,
  HealthCheck,
} from "../types";

// ========================================
// System & Overview Hooks
// ========================================
export const useOverview = () => {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: () => api.getOverview(),
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 3000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.getServices(),
    refetchInterval: 5000,
    staleTime: 3000,
  });
};

export const useHealth = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.getHealth(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
};

// ========================================
// Service Management Hooks
// ========================================
export const useStartServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (environment?: string) => api.startServices(environment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.overview });
      toast.success("Services started successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to start services: ${error.message}`);
    },
  });
};

export const useStopServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (environment?: string) => api.stopServices(environment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.overview });
      toast.success("Services stopped successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to stop services: ${error.message}`);
    },
  });
};

export const useRestartServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (environment?: string) => api.restartServices(environment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success("Services restarted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to restart services: ${error.message}`);
    },
  });
};

export const useRestartService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceName: string) => api.restartService(serviceName),
    onSuccess: (_, serviceName) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success(`${serviceName} restarted successfully`);
    },
    onError: (error: Error, serviceName) => {
      toast.error(`Failed to restart ${serviceName}: ${error.message}`);
    },
  });
};

export const useInstallService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ServiceInstallRequest) => api.installService(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success(`${request.service} installed successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to install service: ${error.message}`);
    },
  });
};

// ========================================
// Logs Hooks
// ========================================
export const useLogs = (service: string, lines: number = 100) => {
  return useQuery({
    queryKey: queryKeys.logs(service),
    queryFn: () => api.getLogs(service, lines),
    enabled: !!service,
    refetchInterval: 5000,
    staleTime: 2000,
  });
};

// ========================================
// Backup Hooks
// ========================================
export const useBackups = () => {
  return useQuery({
    queryKey: queryKeys.backups,
    queryFn: () => api.listBackups(),
    staleTime: 30000,
  });
};

export const useCreateBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.createBackup(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backups });
      toast.success(`Backup created: ${data.file}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create backup: ${error.message}`);
    },
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => api.restoreBackup(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success("Backup restored successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore backup: ${error.message}`);
    },
  });
};

// ========================================
// Snapshot Hooks
// ========================================
export const useSnapshots = () => {
  return useQuery({
    queryKey: queryKeys.snapshots,
    queryFn: () => api.listSnapshots(),
    staleTime: 60000,
  });
};

export const useCreateSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => api.createSnapshot(name, description),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.snapshots });
      toast.success(`Snapshot created: ${data.snapshot}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create snapshot: ${error.message}`);
    },
  });
};

export const useRestoreSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => api.restoreSnapshot(name),
    onMutate: () => {
      toast.loading("Restoring snapshot...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.dismiss();
      toast.success("Snapshot restored successfully");
    },
    onError: (error: Error) => {
      toast.dismiss();
      toast.error(`Failed to restore snapshot: ${error.message}`);
    },
  });
};

export const useDeleteSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => api.deleteSnapshot(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.snapshots });
      toast.success("Snapshot deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete snapshot: ${error.message}`);
    },
  });
};

// ========================================
// Command Execution Hook
// ========================================
export const useExecuteCommand = () => {
  return useMutation({
    mutationFn: (request: CommandRequest) => api.executeCommand(request),
    onError: (error: Error) => {
      toast.error(`Command failed: ${error.message}`);
    },
  });
};

// ========================================
// AI Assistant Hook
// ========================================
export const useAskAI = () => {
  return useMutation({
    mutationFn: (query: AIQuery) => api.askAI(query),
    onError: (error: Error) => {
      toast.error(`AI query failed: ${error.message}`);
    },
  });
};

// ========================================
// Environment Variables Hooks
// ========================================
export const useEnvVars = () => {
  return useQuery({
    queryKey: queryKeys.envVars,
    queryFn: () => api.getEnvVars(),
    staleTime: 60000,
  });
};

export const useUpdateEnvVar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.updateEnvVar(key, value),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envVars });
      toast.success(`Environment variable ${key} updated`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update environment variable: ${error.message}`);
    },
  });
};

// ========================================
// WebSocket Hook
// ========================================
import { useEffect, useState, useCallback } from "react";
import { WebSocketClient } from "../lib/api";

export const useWebSocket = (url?: string) => {
  const [ws, setWs] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const client = new WebSocketClient(url);

    client.on("connected", () => {
      setIsConnected(true);
      toast.success("Real-time updates enabled");
    });

    client.on("disconnected", () => {
      setIsConnected(false);
      toast.error("Real-time updates disabled");
    });

    client.on("metrics", (data) => {
      setMetrics(data.data);
    });

    client.on("log", (data) => {
      setLogs((prev) => [...prev.slice(-99), data.data]);
    });

    client.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    client.connect();
    setWs(client);

    return () => {
      client.disconnect();
    };
  }, [url]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    isConnected,
    metrics,
    logs,
    clearLogs,
  };
};

// ========================================
// Custom Hook for Polling with Smart Intervals
// ========================================
export const useSmartPolling = <T>(
  queryFn: () => Promise<T>,
  options: {
    baseInterval?: number;
    maxInterval?: number;
    errorMultiplier?: number;
  } = {},
) => {
  const {
    baseInterval = 5000,
    maxInterval = 30000,
    errorMultiplier = 2,
  } = options;

  const [interval, setInterval] = useState(baseInterval);
  const [errorCount, setErrorCount] = useState(0);

  const query = useQuery({
    queryKey: ["smart-polling", queryFn.toString()],
    queryFn,
    refetchInterval: interval,
    onSuccess: () => {
      setErrorCount(0);
      setInterval(baseInterval);
    },
    onError: () => {
      setErrorCount((prev) => prev + 1);
      setInterval((prev) => Math.min(prev * errorMultiplier, maxInterval));
    },
  });

  return { ...query, currentInterval: interval, errorCount };
};

// ========================================
// Compose Config Hook
// ========================================
export const useComposeConfig = (environment: string) => {
  return useQuery({
    queryKey: queryKeys.composeConfig(environment),
    queryFn: () => api.getComposeConfig(environment),
    enabled: !!environment,
    staleTime: 60000,
  });
};

// ========================================
// Optimistic Updates Hook
// ========================================
export const useOptimisticUpdate = <T>(
  queryKey: readonly unknown[],
  updateFn: (old: T, newData: Partial<T>) => T,
) => {
  const queryClient = useQueryClient();

  const update = useCallback(
    (newData: Partial<T>) => {
      queryClient.setQueryData<T>(queryKey, (old) => {
        if (!old) return old;
        return updateFn(old, newData);
      });
    },
    [queryClient, queryKey, updateFn],
  );

  return update;
};

// ========================================
// Debounced Query Hook
// ========================================
import { useDebounce } from "./useDebounce";

export const useDebouncedQuery = <T>(
  queryFn: (search: string) => Promise<T>,
  searchTerm: string,
  delay: number = 500,
) => {
  const debouncedSearch = useDebounce(searchTerm, delay);

  return useQuery({
    queryKey: ["debounced-query", debouncedSearch],
    queryFn: () => queryFn(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });
};
