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
        padding: '0.625rem 1rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {node.props.href ? (
        <a href={node.props.href} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
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
        padding: '1.25rem 2rem',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--muted) / 0.15)',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
            {item.icon === 'truck' && '🚚'}
            {item.icon === 'shield' && '🛡️'}
            {item.icon === 'refresh' && '🔄'}
            {item.icon === 'star' && '⭐'}
            {!['truck', 'shield', 'refresh', 'star'].includes(item.icon || '') && '✨'}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{item.title}</p>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{item.description}</p>
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
        overflow: 'hidden',
        boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
        transition: 'box-shadow 0.2s',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <div style={{ marginBottom: '0.75rem', color: '#facc15', letterSpacing: '0.1em' }}>
        {'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}
      </div>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1rem', color: 'hsl(var(--foreground))' }}>
        {node.props.text || '"Great product!"'}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
          {(node.props.label || 'C')[0].toUpperCase()}
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {node.props.label || 'Customer'}
        </p>
      </div>
    </div>
  );
}

export function NewsletterSectionNode({ node }: NodeComponentProps) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: 'hsl(var(--muted) / 0.25)',
        borderTop: '1px solid hsl(var(--border))',
        borderBottom: '1px solid hsl(var(--border))',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        {node.props.text || 'Subscribe'}
      </h3>
      <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
        {node.props.label || 'Get updates delivered to your inbox.'}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', maxWidth: '24rem', margin: '0 auto' }}>
        <input
          placeholder={node.props.placeholder || 'Enter your email'}
          readOnly
          style={{
            flex: 1,
            padding: '0.625rem 0.875rem',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'hsl(var(--background))',
            minWidth: 0,
          }}
        />
        <button
          style={{
            padding: '0.625rem 1.5rem',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 3px hsl(var(--primary) / 0.2)',
          }}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}

export function HeroSectionNode({ node }: NodeComponentProps) {
  const opacity = parseFloat(node.props.overlayOpacity || '0.55');
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: node.style.minHeight || '32rem',
        padding: node.style.padding || '4rem 2rem',
        overflow: 'hidden',
        ...s(node.style),
        backgroundImage: undefined,
        backgroundColor: undefined,
      }}
      data-node-id={node.id}
    >
      {node.props.src && (
        <img
          src={node.props.src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0, 0, 0, ${opacity})`,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '48rem', width: '100%' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            letterSpacing: '-0.025em',
          }}
        >
          {node.props.text || 'Hero Title'}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '36rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {node.props.subtitle || 'Subtitle goes here'}
        </p>
        {node.props.ctaText && (
          <a
            href={node.props.ctaHref || '#'}
            style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            {node.props.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
