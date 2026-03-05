import { useDraggable } from '@dnd-kit/core';
import { LayoutGrid, Type, ImageIcon, Square, Columns, AlignVerticalJustifyStart, Minus, Tag, CreditCard, TextCursorInput, ShoppingBag, Navigation, PanelBottom } from 'lucide-react';
import { NodeType } from '@/types/schema';

interface BlockDef {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  category: string;
}

const BLOCKS: BlockDef[] = [
  { type: 'Section', label: 'Section', icon: Square, category: 'Layout' },
  { type: 'Container', label: 'Container', icon: AlignVerticalJustifyStart, category: 'Layout' },
  { type: 'Grid', label: 'Grid', icon: LayoutGrid, category: 'Layout' },
  { type: 'Stack', label: 'Stack', icon: Columns, category: 'Layout' },
  { type: 'Text', label: 'Text', icon: Type, category: 'Content' },
  { type: 'Image', label: 'Image', icon: ImageIcon, category: 'Content' },
  { type: 'Divider', label: 'Divider', icon: Minus, category: 'Content' },
  { type: 'Badge', label: 'Badge', icon: Tag, category: 'Content' },
  { type: 'Button', label: 'Button', icon: Square, category: 'UI' },
  { type: 'Card', label: 'Card', icon: CreditCard, category: 'UI' },
  { type: 'Input', label: 'Input', icon: TextCursorInput, category: 'UI' },
  { type: 'ProductCard', label: 'Product Card', icon: ShoppingBag, category: 'Commerce' },
  { type: 'Navbar', label: 'Navbar', icon: Navigation, category: 'Site' },
  { type: 'Footer', label: 'Footer', icon: PanelBottom, category: 'Site' },
];

function DraggableBlock({ block }: { block: BlockDef }) {
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
  const categories = [...new Set(BLOCKS.map((b) => b.category))];

  return (
    <div className="p-3 space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCKS.filter((b) => b.category === cat).map((b) => (
              <DraggableBlock key={b.type} block={b} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
