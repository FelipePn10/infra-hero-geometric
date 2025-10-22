import React from "react";
import { Environment } from "../types";
import {
  Play,
  Square,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Settings,
} from "lucide-react";

interface QuickActionsProps {
  environment: Environment;
}

export default function QuickActions({ environment }: QuickActionsProps) {
  const actions = [
    {
      name: "Deploy All",
      description: "Deploy all services to production",
      icon: Upload,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => console.log("Deploying all..."),
    },
    {
      name: "Restart All",
      description: "Restart all running services",
      icon: RefreshCw,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => console.log("Restarting all..."),
    },
    {
      name: "Stop All",
      description: "Stop all services gracefully",
      icon: Square,
      color: "bg-red-600 hover:bg-red-700",
      onClick: () => console.log("Stopping all..."),
    },
    {
      name: "Backup",
      description: "Create environment backup",
      icon: Download,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => console.log("Creating backup..."),
    },
    {
      name: "Cleanup",
      description: "Remove unused resources",
      icon: Trash2,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => console.log("Cleaning up..."),
    },
    {
      name: "Configure",
      description: "Environment settings",
      icon: Settings,
      color: "bg-gray-600 hover:bg-gray-700",
      onClick: () => console.log("Opening settings..."),
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl">
      <div className="border-b border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        <p className="text-sm text-gray-400">
          Common actions for {environment} environment
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => (
            <button
              key={action.name}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center rounded-xl p-4 text-white transition-all ${action.color} aspect-square`}
            >
              <action.icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">{action.name}</span>
            </button>
          ))}
        </div>

        {/* Environment-specific warnings */}
        {environment === "prod" && (
          <div className="mt-4 rounded-lg bg-red-400/10 p-4 border border-red-400/20">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">Production Environment</span>
            </div>
            <p className="mt-1 text-sm text-red-300">
              You are operating in production. Actions here will affect live
              services.
            </p>
          </div>
        )}

        {environment === "staging" && (
          <div className="mt-4 rounded-lg bg-yellow-400/10 p-4 border border-yellow-400/20">
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-lg">🔄</span>
              <span className="font-medium">Staging Environment</span>
            </div>
            <p className="mt-1 text-sm text-yellow-300">
              This is the staging environment for testing before production
              deployment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
