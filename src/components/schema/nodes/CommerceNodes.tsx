import React, { useMemo } from 'react';
import { SchemaNode, RenderMode, NodeStyle, Schema, ThemeTokens } from '@/types/schema';
import { nodeStyleToCSS, generatePseudoStateCSS, generateResponsiveCSS, themeTokensToCSS } from '@/lib/style-utils';
import { useThemeTokens } from '@/components/schema/ThemeContext';
import { hydrateCardTemplate, ProductData } from '@/lib/card-template-utils';
import { getNodeComponent } from '@/components/schema/NodeRegistry';
import { DEFAULT_SAMPLE_PRODUCTS, DEFAULT_SAMPLE_COLLECTIONS } from '@/lib/host-data';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
  mockData?: Record<string, any>;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

/** Layout variants for ProductCard */
type CardLayout = 'vertical' | 'horizontal' | 'minimal' | 'overlay';

export function ProductCardNode({ node, mode, renderChildren }: NodeComponentProps) {
  const themeTokens = useThemeTokens();
  const layout: CardLayout = (node.props.cardLayout as CardLayout) || themeTokens?.defaultCardLayout || 'vertical';

  // ── Composite mode: if node has children, render them instead of monolithic HTML ──
  if (node.children && node.children.length > 0) {
    const compositeStyle: React.CSSProperties = {
      ...s(node.style),
      ...(layout === 'horizontal' ? { display: 'flex', flexDirection: 'row' } : {}),
    };

    return (
      <div
        style={compositeStyle}
        data-node-id={node.id}
        className="group hover:shadow-lg hover:-translate-y-0.5"
      >
        {renderChildren(node.children)}
      </div>
    );
  }

  // ── Legacy monolithic rendering (for backwards compatibility) ──
  const productName = node.props.name || node.props.text || 'Product Name';
  const productImage = node.props.image || node.props.src || '/placeholder.svg';
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

/* ═══════════════════════════════════════════════════════════
   ProductGrid — fully host-driven, no direct DB fetches
   ═══════════════════════════════════════════════════════════ */

export function ProductGridNode({ node, mode, mockData }: NodeComponentProps) {
  const columns = Number(node.props.columns) || 4;
  const limit = Number(node.props.limit) || 8;
  const categoryFilter = node.props.category as string || '';
  const sortOrder = node.props.sort as string || '';
  const gap = (node.props.gap as string) || '1.5rem';

  // ── Resolve products: mockData (host-injected) > DEFAULT_MOCK ──
  const products = useMemo(() => {
    const source: ProductData[] = mockData?.products || DEFAULT_SAMPLE_PRODUCTS;
    let filtered = [...source];
    if (categoryFilter) {
      filtered = filtered.filter((p: any) => p.category === categoryFilter);
    }
    if (sortOrder === 'price-asc') filtered.sort((a: any, b: any) => a.price - b.price);
    else if (sortOrder === 'price-desc') filtered.sort((a: any, b: any) => b.price - a.price);
    return filtered.slice(0, limit);
  }, [mockData, categoryFilter, sortOrder, limit]);

  // ── Resolve card template from mockData if host provides it ──
  const templateData = useMemo(() => {
    const tpl = mockData?.cardTemplate;
    if (!tpl?.nodes || !tpl?.rootNodeId) return null;
    return { nodes: tpl.nodes as Record<string, SchemaNode>, rootNodeId: tpl.rootNodeId as string, themeTokens: tpl.themeTokens as ThemeTokens | undefined };
  }, [mockData?.cardTemplate]);

  // Build hydrated cards
  const hydratedCards = useMemo(() => {
    if (!templateData || products.length === 0) return [];
    return products.map((product) => {
      const { nodes: cardNodes, rootId } = hydrateCardTemplate(
        templateData.nodes,
        templateData.rootNodeId,
        product,
      );
      return { rootId, nodes: cardNodes, productId: product.id };
    });
  }, [templateData, products]);

  // Convert template's themeTokens into scoped CSS custom properties
  const templateThemeStyle = useMemo<React.CSSProperties>(() => {
    if (!templateData?.themeTokens) return {};
    return themeTokensToCSS(templateData.themeTokens);
  }, [templateData?.themeTokens]);

  // Generate dynamic CSS (pseudo-states, custom CSS) for all hydrated nodes
  const templateDynamicCSS = useMemo(() => {
    if (hydratedCards.length === 0) return '';
    const rules: string[] = [];
    for (const { nodes } of hydratedCards) {
      for (const n of Object.values(nodes)) {
        const pseudo = generatePseudoStateCSS(n.id, n.style);
        if (pseudo) rules.push(pseudo);
        const responsive = generateResponsiveCSS(n.id, n.style);
        if (responsive) rules.push(responsive);
        if (n.customCSS) {
          rules.push(n.customCSS.replace(/selector/g, `[data-node-id="${n.id}"]`));
        }
      }
    }
    return rules.join('\n');
  }, [hydratedCards]);

  const handleAddToCart = (productId: string) => {
    window.dispatchEvent(new CustomEvent('nexora:addToCart', { detail: { productId } }));
  };

  // Recursive renderer for hydrated nodes
  const renderHydratedNode = (nodeId: string, nodes: Record<string, SchemaNode>): React.ReactNode => {
    const n = nodes[nodeId];
    if (!n || n.hidden) return null;

    const Component = getNodeComponent(n.type);
    if (!Component) return null;

    const renderChildren = (childIds: string[]) => (
      <>{childIds.map((cid) => renderHydratedNode(cid, nodes))}</>
    );

    // Wrap buttons with addToCart handler
    if (n.type === 'Button' && n.props._productId) {
      return (
        <div key={n.id} onClick={() => handleAddToCart(n.props._productId)}>
          <Component node={n} mode="public" renderChildren={renderChildren} />
        </div>
      );
    }

    return <Component key={n.id} node={n} mode="public" renderChildren={renderChildren} />;
  };

  const gridStyle: React.CSSProperties = {
    ...s(node.style),
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))`,
    gap,
  };

  // ── Template-based rendering ──
  if (templateData && hydratedCards.length > 0) {
    const visibleCards = mode === 'edit' ? hydratedCards.slice(0, columns) : hydratedCards;
    return (
      <div data-node-id={node.id} style={{ ...templateThemeStyle, ...gridStyle }}>
        {templateDynamicCSS && <style dangerouslySetInnerHTML={{ __html: templateDynamicCSS }} />}
        {visibleCards.map(({ rootId, nodes }) => (
          <div key={rootId} style={{ ...(mode === 'edit' ? { pointerEvents: 'none' } : {}), width: '100%', minWidth: 0, overflow: 'hidden' }}>
            {renderHydratedNode(rootId, nodes)}
          </div>
        ))}
      </div>
    );
  }

  // ── Inline fallback rendering (no template) ──
  if (products.length > 0) {
    const visibleProducts = mode === 'edit' ? products.slice(0, columns) : products;
    return (
      <div data-node-id={node.id} style={gridStyle}>
        {visibleProducts.map((product, i) => (
          <div
            key={product.id || i}
            style={{
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
              ...(mode === 'edit' ? { pointerEvents: 'none' } : {}),
            }}
          >
            <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.badge && (
                <span style={{
                  position: 'absolute', top: '0.75rem', left: '0.75rem',
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                  fontWeight: '600', backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))', zIndex: 2,
                }}>
                  {product.badge}
                </span>
              )}
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '600', fontSize: '1rem' }}>${product.price?.toFixed(2)}</span>
                {product.original_price && (
                  <span style={{ textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ──
  return (
    <div
      data-node-id={node.id}
      style={gridStyle}
    >
      {Array.from({ length: Math.min(columns, 4) }).map((_, i) => (
        <div
          key={i}
          style={{
            border: '1px dashed hsl(var(--border))',
            borderRadius: '0.75rem',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            minHeight: '200px',
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          }}
        >
          <span style={{ fontSize: '2rem' }}>🛍️</span>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
            {mode === 'edit' ? 'Product Card' : 'No products'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION GRID — fully host-driven, no direct DB fetches
// ═══════════════════════════════════════════════════════════════════════════
export function CollectionGridNode({ node, mode, mockData }: NodeComponentProps) {
  const columns = node.props.columns || 3;
  const gap = node.props.gap || '1.5rem';
  const showTitle = node.props.showTitle !== false;
  const showCount = node.props.showCount !== false;

  // Use mock data from host or fallback to default
  const sourceCollections = mockData?.collections || DEFAULT_MOCK_COLLECTIONS;
  const mockCollections = sourceCollections.map((c: any) => ({
    name: c.name,
    image: c.image || c.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    count: c.productCount || c.count || 0,
  }));

  const limit = node.props.limit || 6;
  const collections = mockCollections.slice(0, limit);

  return (
    <div
      className="nxr-collection-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {collections.map((col, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
        >
          <img
            src={col.image}
            alt={col.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}
          >
            {showTitle && (
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem' }}>
                {col.name}
              </p>
            )}
            {showCount && (
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                {col.count} products
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
