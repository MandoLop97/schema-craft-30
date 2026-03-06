import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => style as unknown as React.CSSProperties;

export function AnnouncementBarNode({ node }: NodeComponentProps) {
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        textAlign: 'center',
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {node.props.href ? (
        <a href={node.props.href} style={{ color: 'inherit', textDecoration: 'underline' }}>
          {node.props.text || 'Announcement'}
        </a>
      ) : (
        node.props.text || 'Announcement'
      )}
    </div>
  );
}

export function FeatureBarNode({ node }: NodeComponentProps) {
  const items = node.props.items || [];
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid hsl(var(--border))',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>
            {item.icon === 'truck' && '🚚'}
            {item.icon === 'shield' && '🛡️'}
            {item.icon === 'refresh' && '🔄'}
            {item.icon === 'star' && '⭐'}
            {!['truck', 'shield', 'refresh', 'star'].includes(item.icon || '') && '✨'}
          </span>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</p>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TestimonialCardNode({ node }: NodeComponentProps) {
  const stars = parseInt(node.props.variant || '5', 10);
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <div style={{ marginBottom: '0.75rem', color: '#facc15' }}>
        {'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}
      </div>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1rem' }}>
        {node.props.text || '"Great product!"'}
      </p>
      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
        {node.props.label || 'Customer'}
      </p>
    </div>
  );
}

export function NewsletterSectionNode({ node }: NodeComponentProps) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: 'hsl(var(--muted) / 0.3)',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {node.props.text || 'Subscribe'}
      </h3>
      <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: '1.25rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
        {node.props.label || 'Get updates delivered to your inbox.'}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', maxWidth: '24rem', margin: '0 auto' }}>
        <input
          placeholder={node.props.placeholder || 'Enter your email'}
          readOnly
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <button
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}
