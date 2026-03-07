import React, { useState, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Copy, Trash2, CopyPlus, ClipboardPaste, Save, Move } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const EDITABLE_SECTION_TYPES = new Set([
  'Navbar', 'Footer', 'ProductCard',
]);

interface SortableNodeWrapperProps {
  nodeId: string;
  children: React.ReactNode;
  isSelected: boolean;
  nodeType: string;
  onSelect: (id: string) => void;
  onCopy?: (id: string) => void;
  onPaste?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  canPaste?: boolean;
  onEditSection?: (nodeType: string) => void;
  onSaveAsTemplate?: (nodeId: string) => void;
  /** Pass the node's position-related styles so the wrapper can inherit absolute/fixed positioning */
  nodeStyle?: { position?: string; top?: string; left?: string; right?: string; bottom?: string; zIndex?: string };
}

export function SortableNodeWrapper({ nodeId, children, isSelected, nodeType, onSelect, onCopy, onPaste, onDuplicate, onDelete, canPaste, onEditSection, onSaveAsTemplate, nodeStyle }: SortableNodeWrapperProps) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nodeId,
    data: { type: 'sortable', nodeId },
  });

  const isEditableSection = EDITABLE_SECTION_TYPES.has(nodeType);
  const showEditButton = isEditableSection && !isDragging && (hovered || isSelected);

  // If the node has absolute/fixed positioning, apply it to the wrapper so it positions correctly
  const isAbsoluteOrFixed = nodeStyle?.position === 'absolute' || nodeStyle?.position === 'fixed';

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'box-shadow 250ms cubic-bezier(.4,0,.2,1), opacity 200ms ease, transform 200ms ease, outline 250ms cubic-bezier(.4,0,.2,1)',
    opacity: isDragging ? 0.45 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: isAbsoluteOrFixed ? nodeStyle!.position as any : 'relative',
    ...(isAbsoluteOrFixed && {
      top: nodeStyle?.top,
      left: nodeStyle?.left,
      right: nodeStyle?.right,
      bottom: nodeStyle?.bottom,
      zIndex: nodeStyle?.zIndex,
    }),
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

  const innerContent = (
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
      {isSelected && <div className="nxr-selection-label">{nodeType}</div>}
      {isSelected && <div className="nxr-selection-accent-top" />}
      {isSelected && <div className="nxr-selection-accent-left" />}
      {showEditButton && (
        <button
          className="nxr-edit-section-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onEditSection) {
              onEditSection(nodeType);
            } else {
              onSelect(nodeId);
            }
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

  // Only wrap with context menu if handlers are provided
  if (!onCopy && !onDelete) return innerContent;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {innerContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onCopy?.(nodeId)} className="gap-2 text-xs">
          <Copy className="h-3.5 w-3.5" /> Copiar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onPaste?.(nodeId)} disabled={!canPaste} className="gap-2 text-xs">
          <ClipboardPaste className="h-3.5 w-3.5" /> Pegar
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate?.(nodeId)} className="gap-2 text-xs">
          <CopyPlus className="h-3.5 w-3.5" /> Duplicar
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onSaveAsTemplate?.(nodeId)} className="gap-2 text-xs">
          <Save className="h-3.5 w-3.5" /> Guardar como Template
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDelete?.(nodeId)} className="gap-2 text-xs text-destructive focus:text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}