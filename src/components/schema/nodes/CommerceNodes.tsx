import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => style as unknown as React.CSSProperties;

export function ProductCardNode({ node }: NodeComponentProps) {
  const productName = node.props.name || node.props.text || 'Product Name';
  const productImage = node.props.image || node.props.src || '/placeholder.svg';
  return (
    <div
      style={{
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...s(node.style),
      }}
      data-node-id={node.id}
      className="group hover:shadow-lg hover:-translate-y-0.5"
    >
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
        <img
          src={productImage}
          alt={productName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          className="group-hover:scale-105"
        />
        {node.props.badge && (
          <span
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            {node.props.badge}
          </span>
        )}
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
          {productName}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>{node.props.price || '$0'}</span>
          {node.props.originalPrice && (
            <span style={{ textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
              {node.props.originalPrice}
            </span>
          )}
        </div>
        <button
          style={{
            marginTop: '0.75rem',
            width: '100%',
            padding: '0.5rem',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          className="hover:bg-accent"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
