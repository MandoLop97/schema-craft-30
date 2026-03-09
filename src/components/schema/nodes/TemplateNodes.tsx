import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

// ═══════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR
// ═══════════════════════════════════════════════════════════════════════════
export function AnnouncementBarNode({ node }: NodeComponentProps) {
  return (
    <div
      className="nxr-announcement"
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

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE BAR
// ═══════════════════════════════════════════════════════════════════════════
export function FeatureBarNode({ node }: NodeComponentProps) {
  const items = (node.props.items || []).map(item => ({
    ...item,
    description: item.description || '',
  }));
  return (
    <div
      className="nxr-feature-bar"
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
      {items.map((item, i) => {
        const iconKey = (item.icon || '').toLowerCase();
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
              {iconKey === 'truck' && '🚚'}
              {iconKey === 'shield' && '🛡️'}
              {iconKey === 'refresh' && '🔄'}
              {iconKey === 'rotateccw' && '🔄'}
              {iconKey === 'star' && '⭐'}
              {!['truck', 'shield', 'refresh', 'rotateccw', 'star'].includes(iconKey) && '✨'}
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{item.title}</p>
              {item.description && (
                <p className="nxr-feature-desc" style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIAL CARD (single)
// ═══════════════════════════════════════════════════════════════════════════
export function TestimonialCardNode({ node }: NodeComponentProps) {
  const stars = node.props.stars ?? parseInt(node.props.variant || '5', 10);
  const quote = node.props.quote || node.props.text || '"Great product!"';
  const author = node.props.author || node.props.label || 'Customer';
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
        {quote}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
          {author[0].toUpperCase()}
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {author}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NEWSLETTER SECTION
// ═══════════════════════════════════════════════════════════════════════════
export function NewsletterSectionNode({ node }: NodeComponentProps) {
  const heading = node.props.heading || node.props.text || 'Subscribe';
  const subtitle = node.props.subtitle || node.props.label || 'Get updates delivered to your inbox.';
  return (
    <div
      className="nxr-newsletter"
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
      <h3 style={{ fontSize: 'clamp(1.25rem, 3cqi, 1.5rem)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        {heading}
      </h3>
      <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 'clamp(0.8rem, 2cqi, 0.9rem)', marginBottom: '1.5rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
        {subtitle}
      </p>
      <div className="nxr-newsletter-form" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', maxWidth: '24rem', margin: '0 auto', flexWrap: 'wrap' }}>
        <input
          placeholder={node.props.placeholder || 'Enter your email'}
          readOnly
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            padding: '0.625rem 0.875rem',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            backgroundColor: 'hsl(var(--background))',
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

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════
export function HeroSectionNode({ node }: NodeComponentProps) {
  const opacity = parseFloat(node.props.overlayOpacity || '0.55');
  const heading = node.props.heading || node.props.text || 'Hero Title';
  const bgSrc = node.props.src || node.props.image;
  const ctaLink = node.props.ctaLink || node.props.ctaHref || '#';
  return (
    <div
      className="nxr-hero"
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
      {bgSrc && (
        <img
          src={bgSrc}
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
      <div className="nxr-hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '48rem', width: '100%' }}>
        {node.props.overlayText && (
          <span style={{
            display: 'inline-block',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            marginBottom: '1.25rem',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {node.props.overlayText}
          </span>
        )}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 6cqi, 3.5rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            letterSpacing: '-0.025em',
          }}
        >
          {heading}
        </h1>
        <p
          style={{
            fontSize: 'clamp(0.875rem, 3cqi, 1.25rem)',
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
        <div className="nxr-hero-cta" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {node.props.ctaText && (
            <a
              href={ctaLink}
              className="nxr-hero-btn"
              style={{
                display: 'inline-block',
                padding: '0.875rem 2.5rem',
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: 'clamp(0.875rem, 2cqi, 1rem)',
                textDecoration: 'none',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              }}
            >
              {node.props.ctaText}
            </a>
          )}
          {node.props.secondaryCtaText && (
            <a
              href={node.props.secondaryCtaLink || '#'}
              className="nxr-hero-btn-secondary"
              style={{
                display: 'inline-block',
                padding: '0.875rem 2.5rem',
                backgroundColor: 'transparent',
                color: '#fff',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: 'clamp(0.875rem, 2cqi, 1rem)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.4)',
                transition: 'background-color 150ms ease',
              }}
            >
              {node.props.secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE BANNER — Clickable promotional banner with overlay text
// ═══════════════════════════════════════════════════════════════════════════
export function ImageBannerNode({ node }: NodeComponentProps) {
  const src = node.props.src || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop';
  const overlayText = node.props.overlayText || '';
  const overlayPosition = node.props.overlayPosition || 'center';
  
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: '2rem', left: '50%', transform: 'translateX(-50%)' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    bottom: { bottom: '2rem', left: '50%', transform: 'translateX(-50%)' },
  };

  const content = (
    <div
      className="nxr-image-banner"
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <img
        src={src}
        alt={node.props.alt || 'Banner'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          minHeight: node.style.minHeight || '300px',
        }}
      />
      {overlayText && (
        <div
          style={{
            position: 'absolute',
            ...positionStyles[overlayPosition],
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: 'clamp(1rem, 3cqi, 1.5rem)',
            fontWeight: 700,
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
          }}
        >
          {overlayText}
        </div>
      )}
    </div>
  );

  if (node.props.href) {
    return <a href={node.props.href} style={{ textDecoration: 'none', display: 'block' }}>{content}</a>;
  }
  return content;
}

// ═══════════════════════════════════════════════════════════════════════════
// RICH TEXT SECTION — Markdown-style content rendering
// ═══════════════════════════════════════════════════════════════════════════
export function RichTextSectionNode({ node }: NodeComponentProps) {
  const content = node.props.content || '';
  const columns = node.props.columns || 1;

  // Simple markdown-ish rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} style={{ fontSize: '1.125rem', fontWeight: 600, margin: '1.5rem 0 0.5rem', color: 'hsl(var(--foreground))' }}>{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} style={{ fontSize: '1.375rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'hsl(var(--foreground))' }}>{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('# ')) {
        return <h1 key={i} style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1rem', color: 'hsl(var(--foreground))' }}>{trimmed.slice(2)}</h1>;
      }
      if (trimmed === '') {
        return <br key={i} />;
      }
      return <p key={i} style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'hsl(var(--muted-foreground))', margin: '0 0 0.75rem' }}>{trimmed}</p>;
    });
  };

  return (
    <div
      className="nxr-rich-text"
      style={{
        ...s(node.style),
        ...(columns === 2 ? { columnCount: 2, columnGap: '2rem' } : {}),
      }}
      data-node-id={node.id}
    >
      {renderContent(content)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION — Call-to-action with buttons
// ═══════════════════════════════════════════════════════════════════════════
export function CTASectionNode({ node }: NodeComponentProps) {
  const heading = node.props.heading || 'Ready to get started?';
  const description = node.props.description || '';
  const bgStyle = node.props.backgroundStyle || 'gradient';

  const backgroundStyles: Record<string, React.CSSProperties> = {
    solid: { backgroundColor: 'hsl(var(--primary))' },
    gradient: { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))' },
    image: { 
      backgroundImage: node.props.backgroundImage ? `url(${node.props.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  };

  return (
    <div
      className="nxr-cta-section"
      style={{
        position: 'relative',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: '0.75rem',
        ...backgroundStyles[bgStyle],
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      <h2 style={{ fontSize: 'clamp(1.5rem, 4cqi, 2.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
        {heading}
      </h2>
      {description && (
        <p style={{ fontSize: 'clamp(0.875rem, 2cqi, 1.125rem)', opacity: 0.9, maxWidth: '36rem', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {node.props.primaryCtaText && (
          <a
            href={node.props.primaryCtaHref || '#'}
            style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'transform 150ms ease',
            }}
          >
            {node.props.primaryCtaText}
          </a>
        )}
        {node.props.secondaryCtaText && (
          <a
            href={node.props.secondaryCtaHref || '#'}
            style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              backgroundColor: 'transparent',
              color: 'inherit',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.4)',
              transition: 'background-color 150ms ease',
            }}
          >
            {node.props.secondaryCtaText}
          </a>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIAL SECTION — Multiple testimonials with layout options
// ═══════════════════════════════════════════════════════════════════════════
export function TestimonialSectionNode({ node }: NodeComponentProps) {
  const heading = node.props.heading || 'What Our Customers Say';
  const testimonials = node.props.testimonials || [];
  const layout = node.props.testimonialLayout || node.props.layout || 'grid';

  return (
    <div
      className="nxr-testimonial-section"
      style={{ ...s(node.style) }}
      data-node-id={node.id}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem', letterSpacing: '-0.02em', color: 'hsl(var(--foreground))' }}>
        {heading}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout === 'stack' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '72rem',
          margin: '0 auto',
        }}
      >
        {testimonials.map((t: any, i: number) => (
          <div
            key={i}
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
            }}
          >
            {t.rating && (
              <div style={{ marginBottom: '0.75rem', color: '#facc15', letterSpacing: '0.1em' }}>
                {'★'.repeat(Math.min(t.rating, 5))}{'☆'.repeat(Math.max(0, 5 - t.rating))}
              </div>
            )}
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1rem', color: 'hsl(var(--foreground))' }}>
              "{t.quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t.avatar ? (
                <img src={t.avatar} alt={t.author} style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>
                  {(t.author || 'A')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.author}</p>
                {t.role && <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{t.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FAQ SECTION — Accordion or grid layout
// ═══════════════════════════════════════════════════════════════════════════
export function FAQSectionNode({ node }: NodeComponentProps) {
  const heading = node.props.heading || 'FAQ';
  const subtitle = node.props.subtitle || '';
  const items = node.props.faqItems || [];
  const layout = node.props.faqLayout || 'accordion';

  return (
    <div
      className="nxr-faq-section"
      style={{ ...s(node.style) }}
      data-node-id={node.id}
    >
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
          {heading}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.95rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          display: layout === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
          flexDirection: layout !== 'grid' ? 'column' : undefined,
          gap: layout === 'grid' ? '1.5rem' : '0',
        }}
      >
        {items.map((item: any, i: number) => (
          <details
            key={i}
            style={{
              borderBottom: layout !== 'grid' ? '1px solid hsl(var(--border))' : undefined,
              border: layout === 'grid' ? '1px solid hsl(var(--border))' : undefined,
              borderRadius: layout === 'grid' ? '0.5rem' : undefined,
              padding: layout === 'grid' ? '1.25rem' : undefined,
            }}
          >
            <summary
              style={{
                padding: layout !== 'grid' ? '1rem 0' : '0 0 0.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'hsl(var(--foreground))',
                listStyle: 'none',
              }}
            >
              {item.question}
            </summary>
            <p style={{
              padding: layout !== 'grid' ? '0 0 1rem' : '0',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'hsl(var(--muted-foreground))',
            }}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
