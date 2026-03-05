import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => style as unknown as React.CSSProperties;

export function ButtonNode({ node }: NodeComponentProps) {
  const variant = node.props.variant || 'default';
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s',
  };

  if (variant === 'default') {
    baseStyle.backgroundColor = 'hsl(var(--primary))';
    baseStyle.color = 'hsl(var(--primary-foreground))';
  } else if (variant === 'outline') {
    baseStyle.backgroundColor = 'transparent';
    baseStyle.border = '1px solid hsl(var(--border))';
    baseStyle.color = 'hsl(var(--foreground))';
  } else if (variant === 'ghost') {
    baseStyle.backgroundColor = 'transparent';
    baseStyle.color = 'hsl(var(--foreground))';
  }

  return (
    <button style={{ ...baseStyle, ...s(node.style) }} data-node-id={node.id}>
      {node.props.text || 'Button'}
    </button>
  );
}

export function CardNode({ node }: NodeComponentProps) {
  const items = node.props.items;
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '0.75rem',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {items?.map((item, i) => (
        <div key={i}>
          {item.icon && (
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem', opacity: 0.7 }}>
              {item.icon === 'truck' && '🚚'}
              {item.icon === 'shield' && '🛡️'}
              {item.icon === 'refresh' && '🔄'}
            </div>
          )}
          <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', lineHeight: '1.5' }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function InputNode({ node }: NodeComponentProps) {
  return (
    <input
      placeholder={node.props.placeholder || 'Enter text...'}
      style={{
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: '1px solid hsl(var(--border))',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        outline: 'none',
        ...s(node.style),
      }}
      data-node-id={node.id}
      readOnly
    />
  );
}
