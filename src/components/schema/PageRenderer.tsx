import React from 'react';
import { Schema, RenderMode } from '@/types/schema';
import { getNodeComponent } from './NodeRegistry';
import { EditableDropZone } from './EditableDropZone';
import { getBlockDef } from '@/lib/block-registry';

interface PageRendererProps {
  schema: Schema;
  mode: RenderMode;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export function PageRenderer({ schema, mode, selectedNodeId, onSelectNode }: PageRendererProps) {
  const renderNode = (nodeId: string): React.ReactNode => {
    const node = schema.nodes[nodeId];
    if (!node || node.hidden) return null;

    const Component = getNodeComponent(node.type);
    if (!Component) return null;

    const renderChildren = (childIds: string[]) =>
      childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid)}</React.Fragment>);

    const element = <Component node={node} mode={mode} renderChildren={renderChildren} />;

    if (mode !== 'edit') return element;

    const isSelected = selectedNodeId === node.id;
    const blockDef = getBlockDef(node.type);
    const canHaveChildren = blockDef?.canHaveChildren ?? false;

    const wrappedElement = canHaveChildren ? (
      <EditableDropZone nodeId={node.id} isEmpty={node.children.length === 0}>
        {element}
      </EditableDropZone>
    ) : (
      element
    );

    return (
      <div
        key={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
        style={{
          outline: isSelected ? '2px solid hsl(var(--primary))' : undefined,
          outlineOffset: isSelected ? '2px' : undefined,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '-1.5rem',
              left: 0,
              fontSize: '0.65rem',
              padding: '0.15rem 0.5rem',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: '0.25rem',
              zIndex: 10,
              fontWeight: 500,
            }}
          >
            {node.type}
          </div>
        )}
        {wrappedElement}
      </div>
    );
  };

  return <div style={{ fontFamily: schema.themeTokens.typography.fontFamily }}>{renderNode(schema.rootNodeId)}</div>;
}
