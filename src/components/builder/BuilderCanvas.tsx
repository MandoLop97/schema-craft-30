import { useDroppable } from '@dnd-kit/core';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema } from '@/types/schema';
import { CustomComponentMap } from '@/components/schema/NodeRegistry';

interface BuilderCanvasProps {
  schema: Schema;
  device: 'desktop' | 'tablet' | 'mobile';
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  customComponents?: CustomComponentMap;
}

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function BuilderCanvas({ schema, device, selectedNodeId, onSelectNode }: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: schema.rootNodeId });

  return (
    <div
      className="flex-1 overflow-auto flex justify-center p-6 nxr-canvas-grid"
      style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
      onClick={() => onSelectNode('')}
    >
      <div
        ref={setNodeRef}
        style={{
          width: DEVICE_WIDTHS[device],
          maxWidth: '100%',
          minHeight: '100%',
          transition: 'width 300ms ease, box-shadow 200ms ease',
        }}
        className={`bg-background border ${isOver ? 'ring-2 ring-primary/20' : ''}`}
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
