import React from "react";
import { OverviewStats, Metric } from "../types";
import { Cpu, Server, CheckCircle, AlertTriangle } from "lucide-react";

interface StatsOverviewProps {
  data: OverviewStats;
  metrics: Metric[];
}

export default function StatsOverview({ data, metrics }: StatsOverviewProps) {
  const stats = [
    {
      label: "Total Services",
      value: data.totalServices.toString(),
      icon: Server,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Running",
      value: data.runningServices.toString(),
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "CPU Usage",
      value: `${data.totalCPU}%`,
      icon: Cpu,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Memory",
      value: `${data.totalMemory}%`,
      // icon: Memory,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ];

  const getHealthStatus = () => {
    const healthPercentage = (data.healthyServices / data.totalServices) * 100;
    if (healthPercentage >= 90)
      return { status: "Healthy", color: "text-green-400" };
    if (healthPercentage >= 70)
      return { status: "Degraded", color: "text-yellow-400" };
    return { status: "Unhealthy", color: "text-red-400" };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {/* Main Stats */}
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`rounded-lg ${stat.bgColor} p-3`}>
              {/*<stat.icon className={`h-6 w-6 ${stat.color}`} />*/}
            </div>
          </div>
        </div>
      ))}

      {/* Health Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-purple-900/30 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">System Health</p>
            <p className={`mt-2 text-3xl font-bold ${healthStatus.color}`}>
              {healthStatus.status}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {data.healthyServices}/{data.totalServices} services
            </p>
          </div>
          <div className="rounded-lg bg-green-400/10 p-3">
            <AlertTriangle className="h-6 w-6 text-green-400" />
          </div>
        </div>

        {/* Health bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500"
            style={{
              width: `${(data.healthyServices / data.totalServices) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
