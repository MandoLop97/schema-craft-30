import React, { useState, useRef, useEffect } from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

/* ── Inline styles for mobile menu ── */
const mobileMenuLinkStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  color: 'hsl(var(--foreground))',
  textDecoration: 'none',
  fontWeight: '500',
  padding: '0.75rem 1.5rem',
  display: 'block',
  borderBottom: '1px solid hsl(var(--border) / 0.5)',
  transition: 'background 0.15s',
};

export function NavbarNode({ node }: NodeComponentProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const announcementText = node.props.announcementText || '';
  const announcementHref = node.props.announcementHref || '';
  const announcementBg = node.props.announcementBg || 'hsl(var(--foreground))';
  const announcementColor = node.props.announcementColor || 'hsl(var(--background))';
  const mobileStyle: 'sidebar' | 'dropdown' = node.props.mobileMenuStyle || 'sidebar';
  const links = node.props.links || [];

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as HTMLElement)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  /* Unique class for container-query scoping */
  const cqClass = `nxr-nav-cq-${node.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div data-node-id={node.id} ref={navRef} className={cqClass}>
      {/* Container-query CSS */}
      <style>{`
        .${cqClass} { container-type: inline-size; container-name: navbarCq; }
        .${cqClass} .nxr-nav-desktop-links { display: flex; }
        .${cqClass} .nxr-nav-hamburger { display: none; }
        .${cqClass} .nxr-nav-mobile-menu { display: none; }
        @container navbarCq (max-width: 767px) {
          .${cqClass} .nxr-nav-desktop-links { display: none !important; }
          .${cqClass} .nxr-nav-hamburger { display: flex !important; }
          .${cqClass} .nxr-nav-mobile-menu { display: block !important; }
        }
      `}</style>

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
            <a href={announcementHref} style={{ color: 'inherit', textDecoration: 'none' }}>{announcementText}</a>
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
          overflow: 'visible',
          ...s(node.style),
        }}
      >
        <span style={{ fontWeight: '700', fontSize: '1.125rem', letterSpacing: '0.04em', flexShrink: 0 }}>
          {node.props.logoText || 'Logo'}
        </span>

        {/* Desktop links */}
        <div className="nxr-nav-desktop-links" style={{ gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {links.map((link: any, i: number) => (
            <a key={i} href={link.href} style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
              {link.text}
            </a>
          ))}
        </div>

        {/* Hamburger button */}
        <button
          className="nxr-nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'hsl(var(--foreground))',
            fontSize: '1.5rem',
            lineHeight: 1,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── Mobile Menu: Dropdown ── */}
      {mobileStyle === 'dropdown' && (
        <div
          className="nxr-nav-mobile-menu"
          style={{
            maxHeight: menuOpen ? `${links.length * 52 + 16}px` : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
            backgroundColor: 'hsl(var(--background))',
            borderBottom: menuOpen ? '1px solid hsl(var(--border))' : 'none',
          }}
        >
          {links.map((link: any, i: number) => (
            <a key={i} href={link.href} onClick={() => setMenuOpen(false)} style={mobileMenuLinkStyle}>
              {link.text}
            </a>
          ))}
        </div>
      )}

      {/* ── Mobile Menu: Sidebar ── */}
      {mobileStyle === 'sidebar' && (
        <div className="nxr-nav-mobile-menu" style={{ position: 'relative' }}>
          {/* Overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 998,
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
            }}
          />
          {/* Sidebar panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              backgroundColor: 'hsl(var(--background))',
              zIndex: 999,
              transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
              boxShadow: menuOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              paddingTop: '1rem',
            }}
          >
            {/* Close button inside sidebar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1.5rem 1rem' }}>
              <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.04em' }}>
                {node.props.logoText || 'Logo'}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'hsl(var(--foreground))' }}
              >✕</button>
            </div>
            {links.map((link: any, i: number) => (
              <a key={i} href={link.href} onClick={() => setMenuOpen(false)} style={mobileMenuLinkStyle}>
                {link.text}
              </a>
            ))}
          </div>
        </div>
      )}
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
          {node.props.links?.map((link: any, i: number) => (
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
