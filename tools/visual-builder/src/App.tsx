import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import PropertiesPanel from "./components/PropertiesPanel";
import Toolbar from "./components/Toolbar";
import { ServiceNode, ServiceTemplate } from "./types";
import { generateYAML } from "./lib/yaml-generator";
import { serviceTemplates } from "./lib/service-templates";
import { toast, Toaster } from "react-hot-toast";

export default function App() {
  const [nodes, setNodes] = useState<ServiceNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Add node to canvas
  const handleAddNode = useCallback(
    (template: ServiceTemplate, position: { x: number; y: number }) => {
      const newNode: ServiceNode = {
        id: `${template.type}-${Date.now()}`,
        type: template.type,
        name: template.name,
        icon: template.icon,
        image: template.image,
        ports: template.ports || [],
        environment: template.environment || [],
        volumes: template.volumes || [],
        networks: ["hero-network"],
        depends_on: [],
        restart: "unless-stopped",
        position,
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNode(newNode);
      toast.success(`${template.name} added to canvas`);
    },
    [],
  );

  // Update node
  const handleUpdateNode = useCallback(
    (id: string, updates: Partial<ServiceNode>) => {
      setNodes((prev) =>
        prev.map((node) => (node.id === id ? { ...node, ...updates } : node)),
      );
      if (selectedNode?.id === id) {
        setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedNode],
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id));
      if (selectedNode?.id === id) {
        setSelectedNode(null);
      }
      toast.success("Service removed");
    },
    [selectedNode],
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;

    if (active.id) {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === active.id
            ? {
                ...node,
                position: {
                  x: node.position.x + delta.x,
                  y: node.position.y + delta.y,
                },
              }
            : node,
        ),
      );
    }

    setActiveId(null);
  }, []);

  // Export YAML
  const handleExport = useCallback(() => {
    try {
      const yaml = generateYAML(nodes);

      // Download file
      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "docker-compose.yml";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("YAML exported successfully");
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  }, [nodes]);

  // Save project
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem("visual-builder-project", JSON.stringify(nodes));
      toast.success("Project saved");
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
    }
  }, [nodes]);

  // Load project
  const handleLoad = useCallback(() => {
    try {
      const saved = localStorage.getItem("visual-builder-project");
      if (saved) {
        const parsedNodes = JSON.parse(saved);
        setNodes(parsedNodes);
        toast.success("Project loaded");
      } else {
        toast.error("No saved project found");
      }
    } catch (error: any) {
      toast.error(`Load failed: ${error.message}`);
    }
  }, []);

  // Clear canvas
  const handleClear = useCallback(() => {
    if (confirm("Clear all services?")) {
      setNodes([]);
      setSelectedNode(null);
      toast.success("Canvas cleared");
    }
  }, []);

  // Deploy
  const handleDeploy = useCallback(async () => {
    try {
      const yaml = generateYAML(nodes);

      // Send to API
      const response = await fetch("http://localhost:5000/api/compose/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yaml }),
      });

      if (response.ok) {
        toast.success("Deployed successfully");
      } else {
        throw new Error("Deploy failed");
      }
    } catch (error: any) {
      toast.error(`Deploy failed: ${error.message}`);
    }
  }, [nodes]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col bg-slate-900">
        <Toaster position="top-right" />

        {/* Toolbar */}
        <Toolbar
          onExport={handleExport}
          onSave={handleSave}
          onLoad={handleLoad}
          onClear={handleClear}
          onDeploy={handleDeploy}
          nodeCount={nodes.length}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Services Sidebar */}
          <Sidebar templates={serviceTemplates} onAddNode={handleAddNode} />

          {/* Canvas */}
          <Canvas
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onAddNode={handleAddNode}
          />

          {/* Properties Panel */}
          <PropertiesPanel
            node={selectedNode}
            onUpdate={(updates) => {
              if (selectedNode) {
                handleUpdateNode(selectedNode.id, updates);
              }
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between border-t border-slate-700 bg-slate-800 px-4 py-2 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>{nodes.length} services</span>
            <span>•</span>
            <span>Visual Builder v2.1</span>
          </div>
          <div>
            {selectedNode ? `Selected: ${selectedNode.name}` : "No selection"}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg">
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
