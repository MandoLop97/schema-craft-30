import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Copy, Trash2, CopyPlus, ClipboardPaste, Save, Move, Paintbrush, ClipboardCheck } from 'lucide-react';
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
  onCopyStyle?: (nodeId: string) => void;
  onPasteStyle?: (nodeId: string) => void;
  canPasteStyle?: boolean;
  /** Pass the node's position-related styles so the wrapper can inherit absolute/fixed positioning */
  nodeStyle?: { position?: string; top?: string; left?: string; right?: string; bottom?: string; zIndex?: string };
  /** Callback to update node position when dragging absolute/fixed elements */
  onRepositionNode?: (nodeId: string, style: { top?: string; left?: string; right?: string; bottom?: string }) => void;
}

export function SortableNodeWrapper({ nodeId, children, isSelected, nodeType, onSelect, onCopy, onPaste, onDuplicate, onDelete, canPaste, onEditSection, onSaveAsTemplate, nodeStyle, onRepositionNode }: SortableNodeWrapperProps) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nodeId,
    data: { type: 'sortable', nodeId },
  });

  const isEditableSection = EDITABLE_SECTION_TYPES.has(nodeType);
  const showEditButton = isEditableSection && !isDragging && (hovered || isSelected);

  // If the node has absolute/fixed positioning, apply it to the wrapper so it positions correctly
  const isAbsoluteOrFixed = nodeStyle?.position === 'absolute' || nodeStyle?.position === 'fixed';

  // ── Visual drag repositioning for absolute/fixed elements ──
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; startTop: number; startLeft: number; parentW: number; parentH: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isAbsoluteOrFixed || !onRepositionNode) return;
    e.stopPropagation();
    e.preventDefault();

    const el = wrapperRef.current;
    if (!el) return;
    const parent = el.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTop: elRect.top - parentRect.top,
      startLeft: elRect.left - parentRect.left,
      parentW: parentRect.width,
      parentH: parentRect.height,
    };

    setIsDraggingPosition(true);
    setDragOffset({ x: 0, y: 0 });
  }, [isAbsoluteOrFixed, onRepositionNode]);

  useEffect(() => {
    if (!isDraggingPosition) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setDragOffset({ x: dx, y: dy });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragStartRef.current || !onRepositionNode) return;
      const { startTop, startLeft, parentW, parentH, x, y } = dragStartRef.current;
      const dx = e.clientX - x;
      const dy = e.clientY - y;

      const newTopPx = startTop + dy;
      const newLeftPx = startLeft + dx;

      // Convert to percentage of parent
      const topPct = Math.round((newTopPx / parentH) * 1000) / 10;
      const leftPct = Math.round((newLeftPx / parentW) * 1000) / 10;

      onRepositionNode(nodeId, {
        top: `${topPct}%`,
        left: `${leftPct}%`,
        right: undefined,
        bottom: undefined,
      });

      setIsDraggingPosition(false);
      setDragOffset({ x: 0, y: 0 });
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPosition, nodeId, onRepositionNode]);

  const style: React.CSSProperties = {
    transform: isDraggingPosition
      ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
      : CSS.Transform.toString(transform),
    transition: isDraggingPosition
      ? 'none'
      : transition || 'box-shadow 250ms cubic-bezier(.4,0,.2,1), opacity 200ms ease, transform 200ms ease, outline 250ms cubic-bezier(.4,0,.2,1)',
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
    ...(isDraggingPosition && {
      outline: '2px solid hsl(var(--primary) / 0.8)',
      boxShadow: '0 8px 24px hsl(var(--primary) / 0.15)',
      cursor: 'move',
    }),
  };

  // For absolute/fixed nodes, don't use DnD sortable listeners (they conflict with position drag)
  const effectiveListeners = isAbsoluteOrFixed ? {} : listeners;

  const setRefs = useCallback((el: HTMLDivElement | null) => {
    setNodeRef(el);
    wrapperRef.current = el;
  }, [setNodeRef]);

  const innerContent = (
    <div
      ref={setRefs}
      style={style}
      data-node-id={nodeId}
      {...attributes}
      {...effectiveListeners}
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
      {/* Drag handle for absolute/fixed positioned elements */}
      {isAbsoluteOrFixed && isSelected && onRepositionNode && (
        <div
          className="nxr-position-drag-handle"
          onMouseDown={handleDragHandleMouseDown}
          title="Arrastrar para reposicionar"
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move',
            zIndex: 50,
            boxShadow: '0 2px 8px hsl(var(--foreground) / 0.15)',
            border: '2px solid hsl(var(--background))',
          }}
        >
          <Move size={11} />
        </div>
      )}
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
