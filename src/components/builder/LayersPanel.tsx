import {
  ChevronDown, Eye, EyeOff, Lock, GripVertical, Copy, Trash2,
  Square, Type, ImageIcon, Navigation, PanelBottom, Layers,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Schema, SchemaNode, NodeType } from '@/types/schema';
import { getBlockDef } from '@/lib/block-registry';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { t } from '@/lib/i18n';

interface LayersPanelProps {
  schema: Schema;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onReorderChildren?: (parentId: string, newChildren: string[]) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, newParentId: string, index: number) => void;
  onRenameNode?: (nodeId: string, newName: string) => void;
  onToggleVisibility?: (nodeId: string) => void;
}

/** Depth-based accent colors for tree lines */
const DEPTH_COLORS = [
  'hsl(var(--primary) / 0.4)',
  'hsl(217 80% 60% / 0.35)',
  'hsl(280 70% 60% / 0.3)',
  'hsl(160 60% 50% / 0.3)',
  'hsl(30 80% 55% / 0.25)',
];

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
}

/** Get the icon for a node type from the block registry */
function getNodeIcon(type: NodeType): React.ElementType {
  const def = getBlockDef(type);
  return def?.icon ?? Square;
}

/** Check if a node type is a container */
function isContainer(type: NodeType): boolean {
  const def = getBlockDef(type);
  return def?.canHaveChildren ?? false;
}

function SortableLayerItem({
  node,
  schema,
  depth,
  selectedNodeId,
  onSelectNode,
  onReorderChildren,
  onDuplicateNode,
  onDeleteNode,
  onMoveNode,
  onRenameNode,
  onToggleVisibility,
  isOverTarget,
}: {
  node: SchemaNode;
  schema: Schema;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onReorderChildren?: (parentId: string, newChildren: string[]) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, newParentId: string, index: number) => void;
  onRenameNode?: (nodeId: string, newName: string) => void;
  onToggleVisibility?: (nodeId: string) => void;
  isOverTarget?: boolean;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;
  const nodeIsContainer = isContainer(node.type);
  const Icon = getNodeIcon(node.type);
  const displayName = node.customName || node.type;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  // Get a short preview text
  const previewText = node.props.text || node.props.logoText || node.props.heading || node.props.placeholder || '';

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Depth tree line */}
      {depth > 0 && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: `${depth * 14 + 4}px`,
            width: '1.5px',
            backgroundColor: getDepthColor(depth),
          }}
        />
      )}

      {/* Node row */}
      <div
        className={`nxr-layer-row group flex items-center gap-1 py-[5px] px-2 text-[11px] cursor-pointer rounded-md transition-all duration-150 relative mx-1 my-[1px] ${
          isSelected
            ? 'nxr-layer-selected'
            : isOverTarget
            ? 'nxr-layer-drop-target'
            : 'hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => onSelectNode(node.id)}
      >
        {/* Active indicator bar */}
        {isSelected && (
          <div
            className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-full"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
        )}

        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </span>

        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded transition-colors shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <div
              style={{
                transition: 'transform 150ms ease',
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            >
              <ChevronDown className="h-3 w-3" />
            </div>
          </button>
        ) : (
          <span className="w-[18px] shrink-0" />
        )}

        {/* Type icon */}
        <div
          className={`shrink-0 h-5 w-5 rounded flex items-center justify-center transition-colors duration-150 ${
            isSelected ? 'bg-primary/15' : nodeIsContainer ? 'bg-muted/60' : 'bg-transparent'
          }`}
        >
          <Icon className={`h-3 w-3 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>

        {/* Type name — double click to rename */}
        {isEditing ? (
          <input
            className="truncate flex-1 font-medium bg-background border border-primary/30 rounded px-1 py-0 text-[11px] outline-none focus:ring-1 focus:ring-primary/50"
            value={editName}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const trimmed = editName.trim();
                if (trimmed && onRenameNode) onRenameNode(node.id, trimmed);
                setIsEditing(false);
              } else if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            onBlur={() => {
              const trimmed = editName.trim();
              if (trimmed && onRenameNode) onRenameNode(node.id, trimmed);
              setIsEditing(false);
            }}
          />
        ) : (
          <span
            className={`truncate flex-1 font-medium ${isSelected ? 'text-primary' : ''}`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditName(displayName);
              setIsEditing(true);
            }}
          >
            {displayName}
          </span>
        )}

        {/* Preview text */}
        {previewText && (
          <span className="text-muted-foreground/50 truncate max-w-[60px] text-[9px] font-mono">
            "{previewText.slice(0, 20)}"
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onToggleVisibility && (
            <button
              className={`p-0.5 transition-colors ${node.hidden ? 'text-muted-foreground/40 hover:text-foreground' : 'text-muted-foreground hover:text-primary'}`}
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(node.id); }}
              title={node.hidden ? 'Show' : 'Hide'}
            >
              {node.hidden ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
            </button>
          )}
          {onDuplicateNode && (
            <button
              className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); onDuplicateNode(node.id); }}
              title="Duplicate"
            >
              <Copy className="h-2.5 w-2.5" />
            </button>
          )}
          {onDeleteNode && node.id !== schema.rootNodeId && (
            <button
              className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
              onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
              title="Delete"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        {/* Persistent hidden indicator (visible even when not hovered) */}
        {node.hidden && (
          <EyeOff className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0 group-hover:hidden" />
        )}
        {node.locked && <Lock className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <SortableChildrenList
          parentNode={node}
          schema={schema}
          depth={depth + 1}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onReorderChildren={onReorderChildren}
          onDuplicateNode={onDuplicateNode}
          onDeleteNode={onDeleteNode}
          onMoveNode={onMoveNode}
          onRenameNode={onRenameNode}
          onToggleVisibility={onToggleVisibility}
        />
      )}
    </div>
  );
}

function SortableChildrenList({
  parentNode,
  schema,
  depth,
  selectedNodeId,
  onSelectNode,
  onReorderChildren,
  onDuplicateNode,
  onDeleteNode,
  onMoveNode,
  onRenameNode,
  onToggleVisibility,
}: {
  parentNode: SchemaNode;
  schema: Schema;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onReorderChildren?: (parentId: string, newChildren: string[]) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, newParentId: string, index: number) => void;
  onRenameNode?: (nodeId: string, newName: string) => void;
  onToggleVisibility?: (nodeId: string) => void;
}) {
  return (
    <SortableContext
      items={parentNode.children}
      strategy={verticalListSortingStrategy}
    >
      {parentNode.children.map((childId) => {
        const child = schema.nodes[childId];
        if (!child) return null;
        return (
          <SortableLayerItem
            key={childId}
            node={child}
            schema={schema}
            depth={depth}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onReorderChildren={onReorderChildren}
            onDuplicateNode={onDuplicateNode}
            onDeleteNode={onDeleteNode}
            onMoveNode={onMoveNode}
            onRenameNode={onRenameNode}
            onToggleVisibility={onToggleVisibility}
          />
        );
      })}
    </SortableContext>
  );
}

export function LayersPanel({
  schema,
  selectedNodeId,
  onSelectNode,
  onReorderChildren,
  onDuplicateNode,
  onDeleteNode,
  onMoveNode,
  onRenameNode,
  onToggleVisibility,
}: LayersPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const locale = t();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const findParent = useCallback(
    (nodeId: string): SchemaNode | null => {
      for (const n of Object.values(schema.nodes)) {
        if (n.children.includes(nodeId)) return n;
      }
      return null;
    },
    [schema.nodes]
  );

  const root = schema.nodes[schema.rootNodeId];
  if (!root)
    return (
      <p className="p-3 text-xs text-muted-foreground">No nodes</p>
    );

  const nodeCount = Object.keys(schema.nodes).length;
  const RootIcon = getNodeIcon(root.type);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const parent = findParent(activeId);
    if (!parent) return;

    // Reorder within same parent
    if (parent.children.includes(overId)) {
      const oldIndex = parent.children.indexOf(activeId);
      const newIndex = parent.children.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newChildren = arrayMove(parent.children, oldIndex, newIndex);
      onReorderChildren?.(parent.id, newChildren);
      return;
    }

    // Cross-parent move: find the over node's parent
    if (onMoveNode) {
      const overParent = findParent(overId);
      if (overParent && overParent.id !== parent.id) {
        const overIndex = overParent.children.indexOf(overId);
        onMoveNode(activeId, overParent.id, overIndex);
      }
    }
  };

  const draggedNode = activeDragId ? schema.nodes[activeDragId] : null;
  const DragIcon = draggedNode ? getNodeIcon(draggedNode.type) : Square;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b flex items-center gap-2"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--muted) / 0.4) 0%, hsl(var(--background)) 100%)',
          borderColor: 'hsl(var(--border) / 0.5)',
        }}
      >
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold">{locale.layers}</span>
        <span
          className="ml-auto text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'hsl(var(--muted) / 0.6)' }}
        >
          {nodeCount}
        </span>
      </div>

      {/* Tree */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto py-1">
          <SortableContext
            items={root.children}
            strategy={verticalListSortingStrategy}
          >
            {/* Root node header */}
            <div
              className={`flex items-center gap-1.5 py-[5px] px-3 text-[11px] cursor-pointer rounded-md transition-all duration-150 mx-1 my-[1px] ${
                selectedNodeId === root.id
                  ? 'nxr-layer-selected'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectNode(root.id)}
            >
              <div className="h-5 w-5 rounded flex items-center justify-center bg-primary/10">
                <RootIcon className="h-3 w-3 text-primary" />
              </div>
              <span className="truncate flex-1 font-semibold">{root.customName || root.type}</span>
              <span className="text-[9px] text-muted-foreground/50 font-mono">{root.children.length}</span>
            </div>

            {root.children.map((childId) => {
              const child = schema.nodes[childId];
              if (!child) return null;
              return (
                <SortableLayerItem
                  key={childId}
                  node={child}
                  schema={schema}
                  depth={1}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onReorderChildren={onReorderChildren}
                  onDuplicateNode={onDuplicateNode}
                  onDeleteNode={onDeleteNode}
                  onMoveNode={onMoveNode}
                  onRenameNode={onRenameNode}
                  onToggleVisibility={onToggleVisibility}
                />
              );
            })}
          </SortableContext>
        </div>

        <DragOverlay>
          {draggedNode && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium nxr-drag-overlay-layer"
            >
              <DragIcon className="h-3 w-3" />
              {draggedNode.customName || draggedNode.type}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
