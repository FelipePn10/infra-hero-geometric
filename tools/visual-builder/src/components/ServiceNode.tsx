import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ServiceNode } from "../types";

interface ServiceNodeProps {
  node: ServiceNode;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ServiceNode>) => void;
  onDelete: () => void;
}

export default function ServiceNodeComponent({
  node,
  selected,
  onSelect,
  onUpdate,
  onDelete,
}: ServiceNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(node.name);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: node.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditedName(node.name);
  };

  const handleNameSave = () => {
    if (editedName.trim() !== "") {
      onUpdate({ name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setEditedName(node.name);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleNameSave();
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: "absolute",
        left: node.position.x,
        top: node.position.y,
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`
        relative min-w-[120px] p-3 rounded-lg border-2 cursor-move
        ${
          selected
            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
            : "border-gray-600 bg-slate-800 hover:border-gray-400"
        }
        transition-all duration-200
      `}
    >
      {/* Header do nó */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {node.icon && <span className="text-lg">{node.icon}</span>}
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyPress}
              className="bg-slate-700 text-white text-sm px-1 py-0.5 rounded border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold text-white text-sm select-none"
              onDoubleClick={handleDoubleClick}
            >
              {node.name}
            </h3>
          )}
        </div>

        {selected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Conteúdo do nó */}
      <div className="text-xs text-gray-300 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Tipo:</span>
          <span className="text-blue-300">{node.type}</span>
        </div>

        {node.status && (
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span
              className={`
              ${node.status === "running" ? "text-green-400" : ""}
              ${node.status === "stopped" ? "text-red-400" : ""}
              ${node.status === "pending" ? "text-yellow-400" : ""}
              ${node.status === "error" ? "text-red-400" : ""}
            `}
            >
              {node.status}
            </span>
          </div>
        )}

        {/* Informações da imagem */}
        <div className="flex justify-between">
          <span className="text-gray-400">Image:</span>
          <span className="text-gray-300 truncate max-w-[80px]">
            {node.image}
          </span>
        </div>

        {/* Portas */}
        {node.ports && node.ports.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Ports:</span>
            <span className="text-gray-300">{node.ports.length}</span>
          </div>
        )}

        {/* Configurações adicionais */}
        {node.config && Object.keys(node.config).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-gray-400 mb-1">Config:</div>
            {Object.entries(node.config).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className="text-gray-300 truncate max-w-[80px]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indicador de seleção */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
}
