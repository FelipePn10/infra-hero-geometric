import React from "react";

interface ToolbarProps {
  onExport: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onDeploy: () => void;
  nodeCount: number;
}

export default function Toolbar({
  onExport,
  onSave,
  onLoad,
  onClear,
  onDeploy,
  nodeCount,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-3">
      {/* Left Section - Logo & Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-xl font-bold text-white">Docker Composer</h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{nodeCount} Services</span>
          </div>
        </div>
      </div>

      {/* Center Section - Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDeploy}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>🚀</span>
          Deploy
        </button>
      </div>

      {/* Right Section - File Operations */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg flex items-center gap-2 transition-colors text-sm"
          title="Save Project"
        >
          <span>💾</span>
          Save
        </button>

        <button
          onClick={onLoad}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg flex items-center gap-2 transition-colors text-sm"
          title="Load Project"
        >
          <span>📂</span>
          Load
        </button>

        <button
          onClick={onExport}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
          title="Export YAML"
        >
          <span>📄</span>
          Export YAML
        </button>

        <button
          onClick={onClear}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
          title="Clear Canvas"
        >
          <span>🗑️</span>
          Clear
        </button>
      </div>
    </div>
  );
}
