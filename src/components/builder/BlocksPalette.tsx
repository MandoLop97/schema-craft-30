import { useDraggable } from '@dnd-kit/core';
import { NodeType } from '@/types/schema';
import { blockRegistry, getCategories, getBlocksByCategory, BlockDefinition } from '@/lib/block-registry';

function DraggableBlock({ block }: { block: BlockDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { type: 'palette', nodeType: block.type },
  });

  const Icon = block.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs cursor-grab hover:bg-muted transition-colors ${isDragging ? 'opacity-50' : ''}`}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{block.label}</span>
    </div>
  );
}

export function BlocksPalette() {
  const categories = getCategories();

  return (
    <div className="p-3 space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {getBlocksByCategory(cat).map((b) => (
              <DraggableBlock key={b.type} block={b} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
