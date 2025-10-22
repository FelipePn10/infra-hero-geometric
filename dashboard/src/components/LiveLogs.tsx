import React, { useState, useRef, useEffect } from "react";
import { LogEntry } from "../types";
import { Search, Filter, Download, Play, Square } from "lucide-react";

interface LiveLogsProps {
  logs: LogEntry[];
}

export default function LiveLogs({ logs }: LiveLogsProps) {
  const [filter, setFilter] = useState<
    "all" | "info" | "warn" | "error" | "debug"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.level === filter;
    const matchesSearch = log.message
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "warn":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "info":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "debug":
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "debug":
        return "🐛";
      default:
        return "📝";
    }
  };

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, autoScroll]);

  const exportLogs = () => {
    const logText = filteredLogs
      .map((log) => `[${log.timestamp}] [${log.level}] ${log.message}`)
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl">
      <div className="border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Live Logs</h2>
            <p className="text-sm text-gray-400">
              Real-time service logs and events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`rounded-lg p-2 transition-all ${
                autoScroll
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-gray-400 hover:bg-slate-600"
              }`}
              title={
                autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"
              }
            >
              {autoScroll ? (
                <Play className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={exportLogs}
              className="rounded-lg bg-slate-700 p-2 text-gray-400 transition-all hover:bg-slate-600 hover:text-white"
              title="Export logs"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["all", "error", "warn", "info", "debug"] as const).map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                    filter === level
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-400 hover:bg-slate-600 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ),
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-slate-700 pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80 overflow-y-auto rounded-lg bg-slate-900/50 p-4">
          {filteredLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No logs match your filters
            </div>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-lg border-l-4 p-3 ${getLevelColor(log.level)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs">{getLevelIcon(log.level)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{log.timestamp}</span>
                        <span>•</span>
                        <span className="uppercase">{log.level}</span>
                        <span>•</span>
                        <span className="text-blue-300">{log.serviceId}</span>
                      </div>
                      <p className="mt-1 text-white">{log.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
