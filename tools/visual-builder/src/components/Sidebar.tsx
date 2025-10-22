import { ServiceTemplate } from "../types";

interface SidebarProps {
  templates: ServiceTemplate[];
  onAddNode: (
    template: ServiceTemplate,
    position: { x: number; y: number },
  ) => void;
}

export default function Sidebar({ templates, onAddNode }: SidebarProps) {
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const handleDragStart = (e: React.DragEvent, template: ServiceTemplate) => {
    e.dataTransfer.setData("application/json", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="w-64 border-r border-slate-700 bg-slate-800 p-4 overflow-y-auto">
      <h2 className="mb-4 text-lg font-bold text-white">Services</h2>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase">
            {category}
          </h3>

          <div className="space-y-2">
            {templates
              .filter((t) => t.category === category)
              .map((template) => (
                <div
                  key={template.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, template)}
                  className="group cursor-grab active:cursor-grabbing rounded-lg bg-slate-700 p-3 transition-all hover:bg-slate-600 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {template.description}
                      </div>
                    </div>
                  </div>

                  {template.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded px-2 py-0.5 text-xs bg-slate-600 text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
