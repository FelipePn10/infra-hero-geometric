import React, { useState, useEffect } from "react";
import { ServiceNode } from "../types";

interface PropertiesPanelProps {
  node: ServiceNode | null;
  onUpdate: (updates: Partial<ServiceNode>) => void;
}

export default function PropertiesPanel({
  node,
  onUpdate,
}: PropertiesPanelProps) {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    ports: [] as string[],
    environment: [] as string[],
    volumes: [] as string[],
  });

  // Update form when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name || "",
        image: node.image || "",
        ports: node.ports ? [...node.ports] : [],
        environment: node.environment ? [...node.environment] : [],
        volumes: node.volumes ? [...node.volumes] : [],
      });
    }
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (node) {
      onUpdate(formData);
    }
  };

  const handleArrayChange = (
    field: "ports" | "environment" | "volumes",
    index: number,
    value: string,
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleAddArrayItem = (field: "ports" | "environment" | "volumes") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveArrayItem = (
    field: "ports" | "environment" | "volumes",
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    if (node) {
      setFormData({
        name: node.name || "",
        image: node.image || "",
        ports: node.ports ? [...node.ports] : [],
        environment: node.environment ? [...node.environment] : [],
        volumes: node.volumes ? [...node.volumes] : [],
      });
    }
  };

  if (!node) {
    return (
      <div className="w-80 border-l border-slate-700 bg-slate-800 p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium mb-2">No Service Selected</h3>
          <p className="text-sm">
            Select a service to configure its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-slate-700 bg-slate-800 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {node.icon && <span className="text-2xl">{node.icon}</span>}
          <div>
            <h2 className="text-xl font-bold text-white">{node.name}</h2>
            <p className="text-sm text-gray-400 capitalize">{node.type}</p>
          </div>
        </div>

        {/* Properties Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Basic Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Docker Image
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., nginx:latest"
                />
              </div>
            </div>
          </div>

          {/* Ports Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">
                Port Mapping
              </h3>
              <button
                type="button"
                onClick={() => handleAddArrayItem("ports")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                Add Port
              </button>
            </div>
            <div className="space-y-2">
              {formData.ports.map((port, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={port}
                    onChange={(e) =>
                      handleArrayChange("ports", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="host:container"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("ports", index)}
                    className="px-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.ports.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  No ports configured
                </p>
              )}
            </div>
          </div>

          {/* Environment Variables */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">
                Environment Variables
              </h3>
              <button
                type="button"
                onClick={() => handleAddArrayItem("environment")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                Add Variable
              </button>
            </div>
            <div className="space-y-2">
              {formData.environment.map((env, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={env}
                    onChange={(e) =>
                      handleArrayChange("environment", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="KEY=value"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("environment", index)}
                    className="px-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.environment.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  No environment variables
                </p>
              )}
            </div>
          </div>

          {/* Volume Mounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">
                Volume Mounts
              </h3>
              <button
                type="button"
                onClick={() => handleAddArrayItem("volumes")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                Add Volume
              </button>
            </div>
            <div className="space-y-2">
              {formData.volumes.map((volume, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={volume}
                    onChange={(e) =>
                      handleArrayChange("volumes", index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="host_path:container_path"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("volumes", index)}
                    className="px-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.volumes.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  No volume mounts
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
