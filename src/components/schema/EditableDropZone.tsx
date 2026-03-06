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
        boxShadow: isOver ? 'inset 0 0 0 2px hsl(var(--primary) / 0.3)' : undefined,
        backgroundColor: isOver ? 'hsl(var(--primary) / 0.04)' : undefined,
        borderRadius: '4px',
        transition: 'box-shadow 200ms ease, background-color 200ms ease',
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
            color: isOver ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.6)',
            fontSize: '0.7rem',
            fontWeight: 500,
            border: `1.5px dashed ${isOver ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))'}`,
            borderRadius: '0.5rem',
            margin: '0.5rem',
            transition: 'all 200ms ease',
            animation: isEmpty && !isOver ? 'breathe 3s ease-in-out infinite' : undefined,
            letterSpacing: '0.02em',
          }}
        >
          <Plus
            size={14}
            style={{
              transition: 'transform 200ms ease',
              transform: isOver ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
          {isOver ? 'Release to drop' : 'Drop block here'}
        </div>
      )}
    </div>
  );
}
