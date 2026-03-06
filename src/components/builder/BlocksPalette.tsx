import { useDraggable } from '@dnd-kit/core';
import { NodeType } from '@/types/schema';
import { blockRegistry, getCategories, getBlocksByCategory, BlockDefinition } from '@/lib/block-registry';
import { translateCategory } from '@/lib/i18n';
import { EDITOR_VERSION } from '@/lib/version';

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
      className={`group flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs cursor-grab transition-all duration-200 ${
        isDragging
          ? 'opacity-40 scale-95'
          : 'hover:shadow-sm hover:border-primary/20 hover:scale-[1.02] active:scale-95'
      }`}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
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
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{translateCategory(cat)}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {getBlocksByCategory(cat).map((b) => (
              <DraggableBlock key={b.type} block={b} />
            ))}
          </div>
        </div>
      ))}
      <div className="pt-3 border-t border-border">
        <span className="text-[10px] text-muted-foreground font-mono">v{EDITOR_VERSION}</span>
      </div>
    </div>
  );
}
