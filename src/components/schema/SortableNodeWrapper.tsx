import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil } from 'lucide-react';

const EDITABLE_SECTION_TYPES = new Set([
  'Navbar', 'Footer', 'ProductCard',
]);

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

  const isEditableSection = EDITABLE_SECTION_TYPES.has(nodeType);
  const showEditButton = isEditableSection && !isDragging && (hovered || isSelected);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'box-shadow 250ms cubic-bezier(.4,0,.2,1), opacity 200ms ease, transform 200ms ease, outline 250ms cubic-bezier(.4,0,.2,1)',
    opacity: isDragging ? 0.45 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    borderRadius: '4px',
    outline: isSelected
      ? '2px solid hsl(var(--primary) / 0.6)'
      : hovered && !isDragging
        ? '1.5px dashed hsl(var(--primary) / 0.25)'
        : '1.5px solid transparent',
    outlineOffset: '2px',
    boxShadow: isSelected
      ? '0 0 0 4px hsl(var(--primary) / 0.08), 0 0 20px hsl(var(--primary) / 0.06)'
      : 'none',
    ...(isDragging && {
      transform: CSS.Transform.toString(transform ? { ...transform, scaleX: 1.01, scaleY: 1.01 } : null),
      outline: '2px solid hsl(var(--primary) / 0.3)',
      boxShadow: '0 12px 32px hsl(var(--foreground) / 0.1), 0 0 0 1px hsl(var(--primary) / 0.15)',
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
      {/* Selected label badge */}
      {isSelected && (
        <div className="nxr-selection-label">
          {nodeType}
        </div>
      )}
      {/* Top accent line */}
      {isSelected && (
        <div className="nxr-selection-accent-top" />
      )}
      {/* Left accent bar */}
      {isSelected && (
        <div className="nxr-selection-accent-left" />
      )}
      {/* Hover edit button for key sections */}
      {showEditButton && (
        <button
          className="nxr-edit-section-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(nodeId);
          }}
          title={`Editar ${nodeType}`}
        >
          <Pencil size={13} />
          <span>Editar</span>
        </button>
      )}
      {children}
    </div>
  );
}