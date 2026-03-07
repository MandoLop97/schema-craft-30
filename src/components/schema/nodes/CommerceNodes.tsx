import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

/** Layout variants for ProductCard */
type CardLayout = 'vertical' | 'horizontal' | 'minimal' | 'overlay';

export function ProductCardNode({ node }: NodeComponentProps) {
  const productName = node.props.name || node.props.text || 'Product Name';
  const productImage = node.props.image || node.props.src || '/placeholder.svg';
  const layout: CardLayout = (node.props.cardLayout as CardLayout) || 'vertical';
  const btnText = node.props.ctaText || 'Add to Cart';
  const btnVariant = node.props.btnVariant || 'outline';
  const showBadge = node.props.badge;
  const showPrice = node.props.price;
  const showOriginalPrice = node.props.originalPrice;
  const showButton = node.props.hideButton !== true;
  const imageRatio = node.props.imageRatio || '1/1';

  const badge = showBadge ? (
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
        zIndex: 2,
      }}
    >
      {node.props.badge}
    </span>
  ) : null;

  const priceBlock = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontWeight: '600', fontSize: '1rem' }}>{showPrice || '$0'}</span>
      {showOriginalPrice && (
        <span style={{ textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
          {showOriginalPrice}
        </span>
      )}
    </div>
  );

  const btnStyle: React.CSSProperties = btnVariant === 'filled'
    ? {
        marginTop: '0.75rem', width: '100%', padding: '0.5rem', border: 'none',
        borderRadius: '0.5rem', backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))',
        fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'opacity 0.2s',
      }
    : {
        marginTop: '0.75rem', width: '100%', padding: '0.5rem', border: '1px solid hsl(var(--border))',
        borderRadius: '0.5rem', backgroundColor: 'transparent', fontSize: '0.875rem',
        fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s',
      };

  // ── Vertical (default) ──
  if (layout === 'vertical') {
    return (
      <div
        style={{
          borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--card))', transition: 'box-shadow 0.2s, transform 0.2s', ...s(node.style),
        }}
        data-node-id={node.id}
        className="group hover:shadow-lg hover:-translate-y-0.5"
      >
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: imageRatio }}>
          <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-105" />
          {badge}
        </div>
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{productName}</h3>
          {priceBlock}
          {showButton && <button style={btnStyle} className="hover:bg-accent">{btnText}</button>}
        </div>
      </div>
    );
  }

  // ── Horizontal ──
  if (layout === 'horizontal') {
    return (
      <div
        style={{
          borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--card))', display: 'flex', transition: 'box-shadow 0.2s', ...s(node.style),
        }}
        data-node-id={node.id}
        className="group hover:shadow-lg"
      >
        <div style={{ position: 'relative', overflow: 'hidden', width: '40%', minHeight: '120px' }}>
          <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-105" />
          {badge}
        </div>
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{productName}</h3>
          {priceBlock}
          {showButton && <button style={{ ...btnStyle, width: 'auto', alignSelf: 'flex-start', padding: '0.4rem 1rem' }} className="hover:bg-accent">{btnText}</button>}
        </div>
      </div>
    );
  }

  // ── Minimal ──
  if (layout === 'minimal') {
    return (
      <div style={{ transition: 'opacity 0.2s', ...s(node.style) }} data-node-id={node.id} className="group">
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.5rem', aspectRatio: imageRatio }}>
          <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-105" />
          {badge}
        </div>
        <div style={{ paddingTop: '0.75rem' }}>
          <h3 style={{ fontWeight: '400', fontSize: '0.875rem' }}>{productName}</h3>
          <span style={{ fontWeight: '600', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{showPrice || '$0'}</span>
        </div>
      </div>
    );
  }

  // ── Overlay ──
  return (
    <div
      style={{
        position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', aspectRatio: imageRatio,
        transition: 'box-shadow 0.2s, transform 0.2s', ...s(node.style),
      }}
      data-node-id={node.id}
      className="group hover:shadow-xl hover:-translate-y-0.5"
    >
      <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="group-hover:scale-105" />
      <div
        style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '1.25rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
        }}
      >
        {badge}
        <h3 style={{ fontWeight: '600', fontSize: '1rem', color: 'white', marginBottom: '0.25rem' }}>{productName}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '600', fontSize: '1rem', color: 'white' }}>{showPrice || '$0'}</span>
          {showOriginalPrice && (
            <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              {showOriginalPrice}
            </span>
          )}
        </div>
        {showButton && (
          <button
            style={{
              marginTop: '0.75rem', padding: '0.4rem 1rem', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
              color: 'white', fontSize: '0.813rem', fontWeight: '500', cursor: 'pointer',
              transition: 'background-color 0.2s', alignSelf: 'flex-start',
            }}
            className="hover:bg-white/30"
          >
            {btnText}
          </button>
        )}
      </div>
    </div>
  );
}
