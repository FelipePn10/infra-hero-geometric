import { useDroppable } from "@dnd-kit/core";
import { ServiceNode, ServiceTemplate } from "../types";
import ServiceNodeComponent from "./ServiceNode";

interface CanvasProps {
  nodes: ServiceNode[];
  selectedNode: ServiceNode | null;
  onSelectNode: (node: ServiceNode | null) => void;
  onUpdateNode: (id: string, updates: Partial<ServiceNode>) => void;
  onDeleteNode: (id: string) => void;
  onAddNode: (
    template: ServiceTemplate,
    position: { x: number; y: number },
  ) => void;
}

export default function Canvas({
  nodes,
  selectedNode,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onAddNode,
}: CanvasProps) {
  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectNode(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("service-template");

    if (data) {
      try {
        const template: ServiceTemplate = JSON.parse(data);
        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onAddNode(template, position);
      } catch (error) {
        console.error("Erro ao processar dados do template:", error);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative flex-1 overflow-auto bg-slate-900 cursor-default"
      style={{
        backgroundImage: `
          linear-gradient(rgba(51, 65, 85, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(51, 65, 85, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div className="relative min-h-[2000px] min-w-[2000px]">
        {nodes.map((node) => (
          <ServiceNodeComponent
            key={node.id}
            node={node}
            selected={selectedNode?.id === node.id}
            onSelect={() => onSelectNode(node)}
            onUpdate={(updates) => onUpdateNode(node.id, updates)}
            onDelete={() => onDeleteNode(node.id)}
          />
        ))}

        {nodes.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl text-gray-400 mb-2">
              Arraste serviços aqui para começar
            </p>
            <p className="text-gray-500">
              Ou use a barra lateral para adicionar serviços
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
