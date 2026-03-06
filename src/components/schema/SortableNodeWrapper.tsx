import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableNodeWrapperProps {
  nodeId: string;
  children: React.ReactNode;
  isSelected: boolean;
  nodeType: string;
  onSelect: (id: string) => void;
}

export function SortableNodeWrapper({ nodeId, children, isSelected, nodeType, onSelect }: SortableNodeWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nodeId,
    data: { type: 'sortable', nodeId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    outline: isSelected ? '2px solid hsl(var(--primary))' : undefined,
    outlineOffset: isSelected ? '2px' : undefined,
    cursor: 'grab',
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(nodeId);
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-1.5rem',
            left: 0,
            fontSize: '0.65rem',
            padding: '0.15rem 0.5rem',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderRadius: '0.25rem',
            zIndex: 10,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {nodeType}
        </div>
      )}
      {children}
    </div>
  );
}
