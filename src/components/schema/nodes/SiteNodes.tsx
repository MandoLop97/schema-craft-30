import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

export function NavbarNode({ node }: NodeComponentProps) {
  const announcementText = node.props.announcementText || '';
  const announcementHref = node.props.announcementHref || '';
  const announcementBg = node.props.announcementBg || 'hsl(var(--foreground))';
  const announcementColor = node.props.announcementColor || 'hsl(var(--background))';

  return (
    <div data-node-id={node.id}>
      {/* Announcement Banner */}
      {announcementText && (
        <div
          className="nxr-announcement-bar"
          style={{
            backgroundColor: announcementBg,
            color: announcementColor,
            textAlign: 'center',
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: '500',
            letterSpacing: '0.01em',
          }}
        >
          {announcementHref ? (
            <a href={announcementHref} style={{ color: 'inherit', textDecoration: 'none' }}>
              {announcementText}
            </a>
          ) : (
            <span>{announcementText}</span>
          )}
        </div>
      )}
      {/* Main Navbar */}
      <nav
        className="nxr-navbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 2rem',
          borderBottom: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--background) / 0.95)',
          position: 'sticky' as const,
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          ...s(node.style),
        }}
      >
        <span style={{ fontWeight: '700', fontSize: '1.125rem', letterSpacing: '0.04em', flexShrink: 0 }}>
          {node.props.logoText || 'Logo'}
        </span>
        <div className="nxr-navbar-links" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {node.props.links?.map((link, i) => (
            <a
              key={i}
              href={link.href}
              style={{
                fontSize: '0.8125rem',
                color: 'hsl(var(--muted-foreground))',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {link.text}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function FooterNode({ node }: NodeComponentProps) {
  return (
    <footer
      className="nxr-footer"
      style={{
        padding: '2.5rem 2rem',
        borderTop: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--muted) / 0.15)',
        marginTop: 'auto',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <div className="nxr-footer-inner" style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.04em' }}>
            {node.props.logoText || 'Logo'}
          </span>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.375rem' }}>
            {node.props.copyright || '© 2026'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {node.props.links?.map((link, i) => (
            <a
              key={i}
              href={link.href}
              style={{
                fontSize: '0.8125rem',
                color: 'hsl(var(--muted-foreground))',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
