import { useDroppable } from '@dnd-kit/core';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema } from '@/types/schema';

interface BuilderCanvasProps {
  schema: Schema;
  device: 'desktop' | 'tablet' | 'mobile';
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function BuilderCanvas({ schema, device, selectedNodeId, onSelectNode }: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: schema.rootNodeId });

  return (
    <div className="flex-1 bg-muted/30 overflow-auto flex justify-center p-6" onClick={() => onSelectNode('')}>
      <div
        ref={setNodeRef}
        style={{
          width: DEVICE_WIDTHS[device],
          maxWidth: '100%',
          minHeight: '100%',
          containerType: 'inline-size' as any,
        }}
        className={`bg-background shadow-sm border transition-all ${isOver ? 'ring-2 ring-primary/30' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <PageRenderer
          schema={schema}
          mode="edit"
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}
