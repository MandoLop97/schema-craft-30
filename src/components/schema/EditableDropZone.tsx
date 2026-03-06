import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface EditableDropZoneProps {
  nodeId: string;
  children: React.ReactNode;
  isEmpty: boolean;
}

export function EditableDropZone({ nodeId, children, isEmpty }: EditableDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: nodeId });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'relative',
        minHeight: isEmpty ? '4rem' : undefined,
        outline: isOver ? '2px dashed hsl(var(--primary))' : undefined,
        outlineOffset: isOver ? '-2px' : undefined,
        backgroundColor: isOver ? 'hsl(var(--primary) / 0.05)' : undefined,
        transition: 'outline 150ms ease, background-color 150ms ease',
      }}
    >
      {children}
      {isEmpty && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            color: isOver ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            fontSize: '0.75rem',
            fontWeight: 500,
            border: `1px dashed ${isOver ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
            borderRadius: '0.375rem',
            margin: '0.5rem',
            transition: 'color 150ms ease, border-color 150ms ease',
          }}
        >
          <Plus size={14} />
          Drop block here
        </div>
      )}
    </div>
  );
}
