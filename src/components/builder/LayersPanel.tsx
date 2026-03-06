import { ChevronRight, ChevronDown, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { Schema, SchemaNode } from '@/types/schema';

interface LayersPanelProps {
  schema: Schema;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

function LayerItem({ node, schema, depth, selectedNodeId, onSelectNode }: {
  node: SchemaNode;
  schema: Schema;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <div className="relative">
      {/* Vertical indent line */}
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
        {/* Active indicator bar */}
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
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded transition-colors"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            <div style={{ transition: 'transform 150ms ease', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              <ChevronDown className="h-3 w-3" />
            </div>
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="truncate flex-1">{node.type}</span>
        {node.props.text && <span className="text-muted-foreground truncate max-w-[80px] text-[10px]">"{node.props.text}"</span>}
        {node.hidden && <EyeOff className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
        {node.locked && <Lock className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      {expanded && hasChildren && node.children.map((childId) => {
        const child = schema.nodes[childId];
        if (!child) return null;
        return (
          <LayerItem
            key={childId}
            node={child}
            schema={schema}
            depth={depth + 1}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        );
      })}
    </div>
  );
}

export function LayersPanel({ schema, selectedNodeId, onSelectNode }: LayersPanelProps) {
  const root = schema.nodes[schema.rootNodeId];
  if (!root) return <p className="p-3 text-xs text-muted-foreground">No nodes</p>;

  return (
    <div className="p-2">
      <LayerItem node={root} schema={schema} depth={0} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
    </div>
  );
}
