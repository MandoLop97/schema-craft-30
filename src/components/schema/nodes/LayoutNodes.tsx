import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

export function SectionNode({ node, mode, renderChildren }: NodeComponentProps) {
  return (
    <section
      style={{
        width: '100%',
        boxSizing: 'border-box' as const,
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {renderChildren(node.children)}
    </section>
  );
}

export function ContainerNode({ node, mode, renderChildren }: NodeComponentProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: node.style.maxWidth || '72rem',
        margin: '0 auto',
        boxSizing: 'border-box' as const,
        paddingLeft: node.style.padding || '1rem',
        paddingRight: node.style.padding || '1rem',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {renderChildren(node.children)}
    </div>
  );
}

export function GridNode({ node, mode, renderChildren }: NodeComponentProps) {
  const cols = node.props.columns || 3;
  const minColWidth = Math.max(180, Math.floor(800 / cols));
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minColWidth}px), 1fr))`,
        width: '100%',
        boxSizing: 'border-box' as const,
        gap: node.style.gap || '1rem',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {renderChildren(node.children)}
    </div>
  );
}

export function StackNode({ node, mode, renderChildren }: NodeComponentProps) {
  const dir = node.props.direction || 'vertical';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: dir === 'horizontal' ? 'row' as const : 'column' as const,
        flexWrap: dir === 'horizontal' ? 'wrap' as const : undefined,
        width: '100%',
        boxSizing: 'border-box' as const,
        gap: node.style.gap || '0.5rem',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {renderChildren(node.children)}
    </div>
  );
}
