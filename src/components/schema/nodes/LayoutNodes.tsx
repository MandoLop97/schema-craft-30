import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => style as unknown as React.CSSProperties;

export function SectionNode({ node, mode, renderChildren }: NodeComponentProps) {
  return (
    <section style={s(node.style)} data-node-id={node.id}>
      {renderChildren(node.children)}
    </section>
  );
}

export function ContainerNode({ node, mode, renderChildren }: NodeComponentProps) {
  return (
    <div
      style={{ maxWidth: '72rem', margin: '0 auto', ...s(node.style) }}
      data-node-id={node.id}
    >
      {renderChildren(node.children)}
    </div>
  );
}

export function GridNode({ node, mode, renderChildren }: NodeComponentProps) {
  const cols = node.props.columns || 3;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
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
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {renderChildren(node.children)}
    </div>
  );
}
