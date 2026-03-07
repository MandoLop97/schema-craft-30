import { ChevronDown, EyeOff, Lock, GripVertical, Copy } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Schema, SchemaNode } from '@/types/schema';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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

interface LayersPanelProps {
  schema: Schema;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onReorderChildren?: (parentId: string, newChildren: string[]) => void;
  onDuplicateNode?: (nodeId: string) => void;
}

function SortableLayerItem({
  node,
  schema,
  depth,
  selectedNodeId,
  onSelectNode,
  onReorderChildren,
  onDuplicateNode,
}: {
  node: SchemaNode;
  schema: Schema;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onReorderChildren?: (parentId: string, newChildren: string[]) => void;
  onDuplicateNode?: (nodeId: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {depth > 0 && (
        <div
          style={{
            position: 'absolute',
            left: `${depth * 12 + 2}px`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'hsl(var(--border))',
            opacity: 0.5,
          }}
        />
      )}
      <div
        className={`group flex items-center gap-1 py-1.5 px-2 text-xs cursor-pointer rounded-sm transition-all duration-150 relative ${
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-muted/60'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelectNode(node.id)}
      >
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '4px',
              bottom: '4px',
              width: '2px',
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: '2px',
            }}
          />
        )}
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </span>
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded transition-colors"
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
          <span className="w-4" />
        )}
        <span className="truncate flex-1">{node.type}</span>
        {node.props.text && (
          <span className="text-muted-foreground truncate max-w-[80px] text-[10px]">
            "{node.props.text}"
          </span>
        )}
        {onDuplicateNode && (
          <button
            className="p-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            onClick={(e) => { e.stopPropagation(); onDuplicateNode(node.id); }}
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
        {node.hidden && (
          <EyeOff className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {node.locked && (
          <Lock className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      {expanded && hasChildren && (
        <SortableChildrenList
          parentNode={node}
          schema={schema}
          depth={depth + 1}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onReorderChildren={onReorderChildren}
          onDuplicateNode={onDuplicateNode}
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
}: {
  parentNode: SchemaNode;
  schema: Schema;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onReorderChildren?: (parentId: string, newChildren: string[]) => void;
  onDuplicateNode?: (nodeId: string) => void;
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
}: LayersPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find parent of active node
    const parent = findParent(activeId);
    if (!parent) return;

    // Only reorder within same parent
    if (!parent.children.includes(overId)) return;

    const oldIndex = parent.children.indexOf(activeId);
    const newIndex = parent.children.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newChildren = arrayMove(parent.children, oldIndex, newIndex);
    onReorderChildren?.(parent.id, newChildren);
  };

  const draggedNode = activeDragId ? schema.nodes[activeDragId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-2">
        <SortableContext
          items={root.children}
          strategy={verticalListSortingStrategy}
        >
          {/* Root node header (non-draggable) */}
          <div
            className={`flex items-center gap-1 py-1.5 px-2 text-xs cursor-pointer rounded-sm transition-all duration-150 ${
              selectedNodeId === root.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-muted/60'
            }`}
            onClick={() => onSelectNode(root.id)}
          >
            <span className="w-4" />
            <span className="truncate flex-1 font-semibold">{root.type}</span>
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
              />
            );
          })}
        </SortableContext>
      </div>
      <DragOverlay>
        {draggedNode && (
          <div
            className="px-3 py-1.5 rounded-md text-xs font-medium border"
            style={{
              backgroundColor: 'hsl(var(--background) / 0.95)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px hsl(var(--foreground) / 0.1)',
              color: 'hsl(var(--primary))',
            }}
          >
            {draggedNode.type}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
