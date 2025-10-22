import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { SearchAddon } from "xterm-addon-search";
import "xterm/css/xterm.css";
import { useExecuteCommand, useServices } from "../../hooks/useServices";
import { CommandRequest } from "../../types";
import { Maximize2, Copy, Download } from "lucide-react";

interface TerminalProps {
  className?: string;
}

export default function Terminal({ className = "" }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedContainer, setSelectedContainer] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: services } = useServices();
  const executeCommand = useExecuteCommand();

  // Initialize Terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Cascadia Code", "Fira Code", Menlo, monospace',
      theme: {
        background: "#1e293b",
        foreground: "#e2e8f0",
        cursor: "#60a5fa",
        black: "#1e293b",
        red: "#ef4444",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#e2e8f0",
        brightBlack: "#475569",
        brightRed: "#f87171",
        brightGreen: "#34d399",
        brightYellow: "#fbbf24",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#f1f5f9",
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    // Welcome message
    term.writeln(
      "\x1b[1;36m╔════════════════════════════════════════════════════════╗\x1b[0m",
    );
    term.writeln(
      "\x1b[1;36m║         Hero Infra - Web Terminal v2.1                ║\x1b[0m",
    );
    term.writeln(
      "\x1b[1;36m╚════════════════════════════════════════════════════════╝\x1b[0m",
    );
    term.writeln("");
    term.writeln("\x1b[1;32m✅ Connected to Hero Infra environment\x1b[0m");
    term.writeln('\x1b[1;33m💡 Type "help" for available commands\x1b[0m');
    term.writeln("");
    term.write("$ ");

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle input
    term.onData((data) => {
      handleTerminalInput(data, term);
    });

    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  // Handle Terminal Input
  const handleTerminalInput = (data: string, term: XTerm) => {
    const code = data.charCodeAt(0);

    // Enter
    if (code === 13) {
      term.write("\r\n");
      if (currentLine.trim()) {
        executeTerminalCommand(currentLine.trim(), term);
        setHistory((prev) => [...prev, currentLine]);
        setHistoryIndex(-1);
      } else {
        term.write("$ ");
      }
      setCurrentLine("");
      return;
    }

    // Backspace
    if (code === 127) {
      if (currentLine.length > 0) {
        setCurrentLine((prev) => prev.slice(0, -1));
        term.write("\b \b");
      }
      return;
    }

    // Ctrl+C
    if (code === 3) {
      term.write("^C\r\n$ ");
      setCurrentLine("");
      return;
    }

    // Ctrl+L (clear)
    if (code === 12) {
      term.clear();
      term.write("$ ");
      setCurrentLine("");
      return;
    }

    // Arrow Up (history)
    if (data === "\x1b[A") {
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const cmd = history[history.length - 1 - newIndex];
        term.write("\r\x1b[K$ " + cmd);
        setCurrentLine(cmd);
        setHistoryIndex(newIndex);
      }
      return;
    }

    // Arrow Down (history)
    if (data === "\x1b[B") {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const cmd = history[history.length - 1 - newIndex];
        term.write("\r\x1b[K$ " + cmd);
        setCurrentLine(cmd);
        setHistoryIndex(newIndex);
      } else if (historyIndex === 0) {
        term.write("\r\x1b[K$ ");
        setCurrentLine("");
        setHistoryIndex(-1);
      }
      return;
    }

    // Tab (autocomplete - future)
    if (code === 9) {
      return;
    }

    // Regular character
    if (code >= 32) {
      setCurrentLine((prev) => prev + data);
      term.write(data);
    }
  };

  // Execute Command
  const executeTerminalCommand = async (cmd: string, term: XTerm) => {
    // Built-in commands
    if (cmd === "help") {
      term.writeln("\x1b[1;36mAvailable Commands:\x1b[0m");
      term.writeln("  \x1b[1;32mhelp\x1b[0m           - Show this help");
      term.writeln("  \x1b[1;32mclear\x1b[0m          - Clear terminal");
      term.writeln("  \x1b[1;32mexit\x1b[0m           - Close terminal");
      term.writeln("  \x1b[1;32mcontainer <name>\x1b[0m - Switch to container");
      term.writeln("  \x1b[1;32mhistory\x1b[0m        - Show command history");
      term.writeln("");
      term.writeln("\x1b[1;36mDocker Commands:\x1b[0m");
      term.writeln("  \x1b[1;32mdocker ps\x1b[0m      - List containers");
      term.writeln("  \x1b[1;32mdocker logs\x1b[0m    - View logs");
      term.writeln("  \x1b[1;32mdocker stats\x1b[0m   - View stats");
      term.writeln("");
      term.writeln("\x1b[1;36mMake Commands:\x1b[0m");
      term.writeln("  \x1b[1;32mmake status\x1b[0m    - Service status");
      term.writeln("  \x1b[1;32mmake logs\x1b[0m      - View all logs");
      term.writeln("  \x1b[1;32mmake backup\x1b[0m    - Backup database");
      term.writeln("");
      term.write("$ ");
      return;
    }

    if (cmd === "clear") {
      term.clear();
      term.write("$ ");
      return;
    }

    if (cmd === "exit") {
      term.writeln("\x1b[1;33mClosing terminal...\x1b[0m");
      setTimeout(() => window.close(), 500);
      return;
    }

    if (cmd.startsWith("container ")) {
      const container = cmd.split(" ")[1];
      setSelectedContainer(container);
      term.writeln(`\x1b[1;33m✅ Switched to container: ${container}\x1b[0m`);
      term.write("$ ");
      return;
    }

    if (cmd === "history") {
      history.forEach((h, i) => {
        term.writeln(`  ${i + 1}  ${h}`);
      });
      term.write("$ ");
      return;
    }

    // Execute via API
    try {
      const request: CommandRequest = {
        command: cmd,
        container: selectedContainer || undefined,
      };

      const result = await executeCommand.mutateAsync(request);

      if (result.output) {
        term.write(result.output);
      }
      if (result.error) {
        term.write("\x1b[1;31m" + result.error + "\x1b[0m");
      }
    } catch (error: any) {
      term.writeln("\x1b[1;31m❌ Error: " + error.message + "\x1b[0m");
    }

    term.write("\r\n$ ");
  };

  // Export logs
  const exportLogs = () => {
    if (!xtermRef.current) return;

    const buffer = xtermRef.current.buffer.active;
    let content = "";

    for (let i = 0; i < buffer.length; i++) {
      const line = buffer.getLine(i);
      if (line) {
        content += line.translateToString(true) + "\n";
      }
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terminal-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy content
  const copyContent = () => {
    if (!xtermRef.current) return;

    const selection = xtermRef.current.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-white">Terminal</h3>

          {/* Container Selector */}
          <select
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Host</option>
            {services?.map((service) => (
              <option key={service.name} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyContent}
            className="rounded-lg p-2 text-gray-400 hover:bg-slate-700 hover:text-white"
            title="Copy selection"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={exportLogs}
            className="rounded-lg p-2 text-gray-400 hover:bg-slate-700 hover:text-white"
            title="Export logs"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg p-2 text-gray-400 hover:bg-slate-700 hover:text-white"
            title="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className={`flex-1 overflow-hidden bg-slate-900 p-4 ${
          isFullscreen ? "fixed inset-0 z-50" : ""
        }`}
      />

      {/* Quick Commands Sidebar */}
      <div className="border-t border-slate-700 bg-slate-800 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "📦 List", cmd: "docker ps" },
            { label: "📊 Stats", cmd: "docker stats --no-stream" },
            { label: "📋 Logs", cmd: "make logs" },
            { label: "💾 Backup", cmd: "make backup" },
            { label: "✅ Status", cmd: "make status" },
          ].map(({ label, cmd }) => (
            <button
              key={cmd}
              onClick={() => {
                if (xtermRef.current) {
                  xtermRef.current.write(cmd + "\r");
                  executeTerminalCommand(cmd, xtermRef.current);
                  setHistory((prev) => [...prev, cmd]);
                }
              }}
              className="rounded-lg bg-slate-700 px-3 py-1 text-sm text-gray-300 hover:bg-slate-600 hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
