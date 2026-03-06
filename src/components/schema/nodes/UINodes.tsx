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
    padding: '0.5rem 1.25rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
    letterSpacing: '0.01em',
  };

  if (variant === 'default') {
    baseStyle.backgroundColor = 'hsl(var(--primary))';
    baseStyle.color = 'hsl(var(--primary-foreground))';
    baseStyle.boxShadow = '0 1px 3px hsl(var(--primary) / 0.2)';
  } else if (variant === 'outline') {
    baseStyle.backgroundColor = 'transparent';
    baseStyle.border = '1px solid hsl(var(--border))';
    baseStyle.color = 'hsl(var(--foreground))';
  } else if (variant === 'secondary') {
    baseStyle.backgroundColor = 'hsl(var(--secondary))';
    baseStyle.color = 'hsl(var(--secondary-foreground))';
  } else if (variant === 'ghost') {
    baseStyle.backgroundColor = 'transparent';
    baseStyle.color = 'hsl(var(--foreground))';
  } else if (variant === 'link') {
    baseStyle.backgroundColor = 'transparent';
    baseStyle.color = 'hsl(var(--primary))';
    baseStyle.padding = '0';
    baseStyle.textDecoration = 'underline';
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
        overflow: 'hidden',
        boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {items?.map((item, i) => (
        <div key={i} style={{ padding: node.style.padding || '1.5rem' }}>
          {item.icon && (
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem', opacity: 0.7 }}>
              {item.icon === 'truck' && '🚚'}
              {item.icon === 'shield' && '🛡️'}
              {item.icon === 'refresh' && '🔄'}
              {!['truck', 'shield', 'refresh'].includes(item.icon || '') && '✨'}
            </div>
          )}
          <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', lineHeight: '1.6' }}>{item.description}</p>
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
        backgroundColor: 'hsl(var(--background))',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...s(node.style),
      }}
      data-node-id={node.id}
      readOnly
    />
  );
}
