import { ChevronRight, ChevronDown, Eye, EyeOff, Lock } from 'lucide-react';
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
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 text-xs cursor-pointer hover:bg-muted/50 transition-colors rounded-sm ${isSelected ? 'bg-primary/10 text-primary font-medium' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelectNode(node.id)}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="truncate flex-1">{node.type}</span>
        {node.props.text && <span className="text-muted-foreground truncate max-w-[80px]">"{node.props.text}"</span>}
        {node.hidden && <EyeOff className="h-3 w-3 text-muted-foreground" />}
        {node.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
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
