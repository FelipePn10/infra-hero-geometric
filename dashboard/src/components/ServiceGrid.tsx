import { Play, Square, RotateCw, Activity, AlertCircle } from "lucide-react";
import { useRestartService } from "../hooks/useServices";
import { ContainerStatus } from "../types";

interface ServiceGridProps {
  services?: ContainerStatus[];
  environment: string;
}

export default function ServiceGrid({
  services = [],
  environment,
}: ServiceGridProps) {
  const restartService = useRestartService();

  const getStatusColor = (state: string) => {
    switch (state) {
      case "running":
        return "bg-green-500";
      case "exited":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "running":
        return <Activity className="h-5 w-5 text-green-400" />;
      case "exited":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="group relative overflow-hidden rounded-2xl bg-slate-800 p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
        >
          {/* Status Indicator */}
          <div className="absolute right-4 top-4">
            <div
              className={`h-3 w-3 rounded-full ${getStatusColor(service.state)} animate-pulse`}
            />
          </div>

          {/* Service Info */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-3">
              {getStatusIcon(service.state)}
              <h3 className="text-lg font-bold text-white">{service.name}</h3>
            </div>
            <p className="text-sm text-gray-400">{service.status}</p>
          </div>

          {/* Metrics */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">CPU</span>
              <span className="font-semibold text-white">{service.cpu}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                style={{ width: service.cpu }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Memory</span>
              <span className="font-semibold text-white">{service.memory}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: service.memory }}
              />
            </div>
          </div>

          {/* Ports */}
          {service.ports && (
            <div className="mb-4">
              <p className="text-xs text-gray-500">Ports: {service.ports}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => restartService.mutate(service.name)}
              disabled={restartService.isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              <RotateCw className="mx-auto h-4 w-4" />
            </button>
            <button className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600">
              Logs
            </button>
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 p-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-gray-500" />
          <p className="text-lg text-gray-400">No services running</p>
          <p className="mt-2 text-sm text-gray-500">
            Start services with "make dev"
          </p>
        </div>
      )}
    </div>
  );
}
