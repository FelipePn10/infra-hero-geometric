import { useState, useMemo } from "react";
import { useOverview, useServices, useWebSocket } from "../hooks/useServices";
import { Environment, LogEntry } from "../types";
import StatsOverview from "./StatsOverview";
import ServiceGrid from "./ServiceGrid";
import LiveLogs from "./LiveLogs";
import QuickActions from "./QuickActions";
import { Loader2, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [currentEnv, setCurrentEnv] = useState<Environment>("dev");
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useOverview();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { isConnected, metrics, logs: rawLogs } = useWebSocket();

  const logs: LogEntry[] = useMemo(() => {
    return rawLogs.map((log, index) => {
      const timestampMatch = log.match(/\[(.*?)\]/);
      const levelMatch = log.match(/\[(ERROR|WARN|INFO|DEBUG)\]/i);
      const serviceMatch = log.match(/\[([a-zA-Z0-9-_]+)\]/g);

      return {
        id: `log-${index}-${Date.now()}`,
        timestamp: timestampMatch
          ? timestampMatch[1]
          : new Date().toISOString(),
        serviceId:
          serviceMatch && serviceMatch[2]
            ? serviceMatch[2].replace(/[\[\]]/g, "")
            : "unknown",
        level: (levelMatch ? levelMatch[1].toLowerCase() : "info") as
          | "info"
          | "warn"
          | "error"
          | "debug",
        message: log,
        environment: currentEnv,
      };
    });
  }, [rawLogs, currentEnv]);

  if (overviewLoading || servicesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-red-400">Failed to load dashboard</p>
          <p className="mt-2 text-sm text-gray-500">{overviewError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
                🚀
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hero Infra</h1>
                <p className="text-sm text-gray-400">Control Panel v2.1</p>
              </div>
            </div>

            {/* Environment Selector */}
            <div className="flex gap-2 rounded-xl bg-slate-700/50 p-1">
              {(["dev", "staging", "prod"] as Environment[]).map((env) => (
                <button
                  key={env}
                  onClick={() => setCurrentEnv(env)}
                  className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                    currentEnv === env
                      ? "bg-white text-slate-900 shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {env.charAt(0).toUpperCase() + env.slice(1)}
                </button>
              ))}
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-400">
                {isConnected ? "Live" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats Overview */}
          <StatsOverview data={overview} metrics={metrics} />

          {/* Quick Actions */}
          <QuickActions environment={currentEnv} />

          {/* Services Grid */}
          <ServiceGrid services={services} environment={currentEnv} />

          {/* Live Logs */}
          <LiveLogs logs={logs} />
        </div>
      </main>
    </div>
  );
}
