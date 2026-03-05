import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => style as unknown as React.CSSProperties;

export function TextNode({ node }: NodeComponentProps) {
  const Tag = (node.props.level || 'p') as keyof JSX.IntrinsicElements;
  return (
    <Tag style={s(node.style)} data-node-id={node.id}>
      {node.props.text || ''}
    </Tag>
  );
}

export function ImageNode({ node }: NodeComponentProps) {
  return (
    <img
      src={node.props.src || '/placeholder.svg'}
      alt={node.props.alt || ''}
      style={{ maxWidth: '100%', height: 'auto', ...s(node.style) }}
      data-node-id={node.id}
    />
  );
}

export function DividerNode({ node }: NodeComponentProps) {
  return (
    <hr
      style={{ border: 'none', borderTop: '1px solid hsl(var(--border))', margin: '1rem 0', ...s(node.style) }}
      data-node-id={node.id}
    />
  );
}

export function BadgeNode({ node }: NodeComponentProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {node.props.text || 'Badge'}
    </span>
  );
}
