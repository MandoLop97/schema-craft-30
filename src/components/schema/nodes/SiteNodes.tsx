import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => style as unknown as React.CSSProperties;

export function NavbarNode({ node }: NodeComponentProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
        position: 'sticky' as const,
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <span style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '0.05em' }}>
        {node.props.logoText || 'Logo'}
      </span>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {node.props.links?.map((link, i) => (
          <a
            key={i}
            href={link.href}
            style={{
              fontSize: '0.875rem',
              color: 'hsl(var(--muted-foreground))',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s',
            }}
            className="hover:text-foreground"
          >
            {link.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function FooterNode({ node }: NodeComponentProps) {
  return (
    <footer
      style={{
        padding: '3rem 2rem',
        borderTop: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
        marginTop: 'auto',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: '700', fontSize: '1.125rem', letterSpacing: '0.05em' }}>
            {node.props.logoText || 'Logo'}
          </span>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
            {node.props.copyright || '© 2026'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {node.props.links?.map((link, i) => (
            <a
              key={i}
              href={link.href}
              style={{
                fontSize: '0.875rem',
                color: 'hsl(var(--muted-foreground))',
                textDecoration: 'none',
              }}
              className="hover:text-foreground"
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
