import React, { useState } from 'react';
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
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nodeId,
    data: { type: 'sortable', nodeId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'box-shadow 200ms ease, opacity 200ms ease, transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isSelected
      ? '0 0 0 2px hsl(var(--primary) / 0.3), 0 0 12px hsl(var(--primary) / 0.08)'
      : hovered && !isDragging
        ? '0 0 0 1px hsl(var(--primary) / 0.15)'
        : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    borderRadius: '2px',
    ...(isDragging && {
      transform: CSS.Transform.toString(transform ? { ...transform, scaleX: 1.01, scaleY: 1.01 } : null),
      boxShadow: '0 8px 24px hsl(var(--foreground) / 0.12), 0 0 0 1px hsl(var(--primary) / 0.2)',
    }),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-node-id={nodeId}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(nodeId);
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-1.25rem',
            left: '0.25rem',
            fontSize: '0.6rem',
            padding: '0.1rem 0.5rem',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderRadius: '0.25rem 0.25rem 0.25rem 0',
            zIndex: 10,
            fontWeight: 600,
            letterSpacing: '0.02em',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 6px hsl(var(--primary) / 0.25)',
            animation: 'slide-in-label 150ms ease-out',
          }}
        >
          {nodeType}
        </div>
      )}
      {/* Left accent bar when selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: 'hsl(var(--primary))',
            borderRadius: '2px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
}
