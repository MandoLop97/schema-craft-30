import { Schema, SchemaNode } from '@/types/schema';
import { CompositeNodeTree } from './block-registry';

type Nodes = Record<string, SchemaNode>;

/**
 * Creates a composite ProductCard node tree with individually editable sub-elements.
 * Returns the rootId and all generated nodes for merging into a schema.
 */
export function productCardNodes(
  id: string,
  opts: { name: string; price: string; image: string; badge?: string; originalPrice?: string }
): { rootId: string; nodes: Nodes } {
  const imgWrapperId = `${id}-img-wrap`;
  const imgId = `${id}-img`;
  const bodyId = `${id}-body`;
  const titleId = `${id}-title`;
  const priceRowId = `${id}-prices`;
  const priceId = `${id}-price`;
  const oldPriceId = `${id}-old-price`;
  const badgeId = `${id}-badge`;
  const btnId = `${id}-btn`;

  const imgWrapChildren: string[] = [imgId];
  const bodyChildren = [titleId, priceRowId, btnId];
  const priceChildren: string[] = [priceId];
  if (opts.originalPrice) priceChildren.push(oldPriceId);

  const nodes: Nodes = {
    [id]: {
      id, type: 'ProductCard', props: {},
      style: { borderRadius: '0.75rem', overflow: 'hidden', borderWidth: '1px', borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', transition: 'box-shadow 0.2s, transform 0.2s' },
      children: [imgWrapperId, bodyId],
    },
    [imgWrapperId]: {
      id: imgWrapperId, type: 'Container', props: {},
      style: { position: 'relative', overflow: 'hidden', width: '100%' },
      children: imgWrapChildren,
    },
    [imgId]: {
      id: imgId, type: 'Image',
      props: { src: opts.image, alt: opts.name },
      style: { width: '100%' },
      children: [],
    },
    [bodyId]: {
      id: bodyId, type: 'Stack', props: { direction: 'vertical' },
      style: { padding: '1rem', gap: '0.5rem' },
      children: bodyChildren,
    },
    [titleId]: {
      id: titleId, type: 'Text',
      props: { text: opts.name, level: 'h3' },
      style: { fontWeight: '500', fontSize: '0.95rem' },
      children: [],
    },
    [priceRowId]: {
      id: priceRowId, type: 'Stack', props: { direction: 'horizontal' },
      style: { gap: '0.5rem', alignItems: 'center' },
      children: priceChildren,
    },
    [priceId]: {
      id: priceId, type: 'Text',
      props: { text: opts.price },
      style: { fontWeight: '600', fontSize: '1rem' },
      children: [],
    },
    [btnId]: {
      id: btnId, type: 'Button',
      props: { text: 'Add to Cart', variant: 'outline' },
      style: { width: '100%', margin: '0.25rem 0 0 0' },
      children: [],
    },
  };

  if (opts.badge) {
    imgWrapChildren.push(badgeId);
    nodes[badgeId] = {
      id: badgeId, type: 'Badge',
      props: { text: opts.badge },
      style: { position: 'absolute', top: '5%', left: '5%', zIndex: '1' },
      children: [],
    };
  }

  if (opts.originalPrice) {
    nodes[oldPriceId] = {
      id: oldPriceId, type: 'Text',
      props: { text: opts.originalPrice },
      style: { textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' },
      children: [],
    };
  }

  return { rootId: id, nodes };
}

const defaultThemeTokens = (): Schema['themeTokens'] => ({
  colors: { primary: '222.2 47.4% 11.2%', secondary: '210 40% 96.1%', background: '0 0% 100%', text: '222.2 84% 4.9%', muted: '215.4 16.3% 46.9%', border: '214.3 31.8% 91.4%', accent: '210 40% 96.1%' },
  typography: { fontFamily: 'system-ui, -apple-system, sans-serif', baseSize: '16px', headingScale: 1.25 },
  radius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '4rem' },
});

function sharedNavbar(): Nodes {
  return {
    navbar: { id: 'navbar', type: 'Navbar', props: { logoText: 'STORE', links: [{ text: 'Shop', href: '/products' }, { text: 'New Arrivals', href: '/products?sort=newest' }, { text: 'Sale', href: '/products?sale=true' }, { text: 'About', href: '/help' }], announcementText: 'Free shipping on orders over $100 — Shop now', announcementHref: '/products' }, style: {}, children: [] },
  };
}

function sharedFooter(): Nodes {
  return {
    footer: { id: 'footer', type: 'Footer', props: { logoText: 'STORE', copyright: '© 2026 STORE. All rights reserved.', links: [{ text: 'All Products', href: '/products' }, { text: 'New Arrivals', href: '/products?sort=newest' }, { text: 'Sale', href: '/products?sale=true' }, { text: 'FAQ', href: '/faq' }, { text: 'Help Center', href: '/help' }, { text: 'Contact', href: '/contact' }, { text: 'Privacy Policy', href: '/privacy' }, { text: 'Terms & Conditions', href: '/terms' }] }, style: {}, children: [] },
  };
}

// ─── HOME ───
export function createHomeSchema(): Schema {
  return {
    id: 'schema-home', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'hero-section', 'trust-bar', 'products-section', 'testimonials-section', 'newsletter-section', 'footer'] },
      ...sharedNavbar(),
      ...sharedNavbar(),
      'hero-section': { id: 'hero-section', type: 'Section', props: {}, style: { backgroundColor: 'hsl(210 40% 98%)', padding: '6rem 2rem 8rem' }, children: ['hero-inner'] },
      'hero-inner': { id: 'hero-inner', type: 'Container', props: {}, style: { maxWidth: '42rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }, children: ['hero-label', 'hero-title', 'hero-subtitle', 'hero-buttons'] },
      'hero-label': { id: 'hero-label', type: 'Text', props: { text: 'New Collection 2026', level: 'p' }, style: { fontSize: '0.875rem', color: '#888', letterSpacing: '0.05em' }, children: [] },
      'hero-title': { id: 'hero-title', type: 'Text', props: { text: 'Essentials for\nmodern living', level: 'h1' }, style: { fontSize: '3.75rem', fontWeight: '600', lineHeight: '1.1', letterSpacing: '-0.025em' }, children: [] },
      'hero-subtitle': { id: 'hero-subtitle', type: 'Text', props: { text: 'Curated products designed with intention. Quality materials, timeless aesthetics, built to last.', level: 'p' }, style: { fontSize: '1.125rem', color: '#888', maxWidth: '28rem', lineHeight: '1.6' }, children: [] },
      'hero-buttons': { id: 'hero-buttons', type: 'Container', props: {}, style: { display: 'flex', gap: '0.75rem' }, children: ['hero-cta-1', 'hero-cta-2'] },
      'hero-cta-1': { id: 'hero-cta-1', type: 'Button', props: { text: 'Shop Collection →', href: '/products' }, style: { padding: '0.75rem 2rem', fontSize: '0.875rem', borderRadius: '0.375rem', backgroundColor: '#111', color: '#fff' }, children: [] },
      'hero-cta-2': { id: 'hero-cta-2', type: 'Button', props: { text: 'New Arrivals', href: '/products?sort=newest' }, style: { padding: '0.75rem 2rem', fontSize: '0.875rem', borderRadius: '0.375rem', backgroundColor: 'transparent', color: '#111', borderWidth: '1px', borderColor: '#ddd' }, children: [] },
      'trust-bar': { id: 'trust-bar', type: 'Section', props: {}, style: { padding: '1.5rem 2rem' }, children: ['trust-grid'] },
      'trust-grid': { id: 'trust-grid', type: 'Grid', props: { columns: 3 }, style: { gap: '1rem', textAlign: 'center' }, children: ['trust-1', 'trust-2', 'trust-3'] },
      'trust-1': { id: 'trust-1', type: 'Text', props: { text: '🚚  Free shipping over $100', level: 'p' }, style: { fontSize: '0.875rem' }, children: [] },
      'trust-2': { id: 'trust-2', type: 'Text', props: { text: '🔄  30-day easy returns', level: 'p' }, style: { fontSize: '0.875rem' }, children: [] },
      'trust-3': { id: 'trust-3', type: 'Text', props: { text: '🛡️  2-year warranty', level: 'p' }, style: { fontSize: '0.875rem' }, children: [] },
      'products-section': { id: 'products-section', type: 'Section', props: {}, style: { padding: '4rem 2rem', maxWidth: '80rem', margin: '0 auto', width: '100%' }, children: ['products-header', 'products-grid'] },
      'products-header': { id: 'products-header', type: 'Container', props: {}, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1.5rem 0' }, children: ['products-title', 'products-link'] },
      'products-title': { id: 'products-title', type: 'Text', props: { text: 'All Products', level: 'h2' }, style: { fontSize: '1.25rem', fontWeight: '600' }, children: [] },
      'products-link': { id: 'products-link', type: 'Button', props: { text: 'View all →', href: '/products' }, style: { backgroundColor: 'transparent', color: '#111', fontSize: '0.875rem', padding: '0.5rem 1rem' }, children: [] },
      'products-grid': { id: 'products-grid', type: 'Grid', props: { columns: 4 }, style: { gap: '1.5rem' }, children: ['product-1', 'product-2', 'product-3', 'product-4'] },
      ...productCardNodes('product-1', { name: 'Minimal Watch', price: '$249', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', badge: 'New' }).nodes,
      ...productCardNodes('product-2', { name: 'Leather Bag', price: '$189', originalPrice: '$249', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' }).nodes,
      ...productCardNodes('product-3', { name: 'Wireless Earbuds', price: '$129', image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop' }).nodes,
      ...productCardNodes('product-4', { name: 'Sunglasses', price: '$159', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', badge: 'Sale' }).nodes,
      'testimonials-section': { id: 'testimonials-section', type: 'Section', props: {}, style: { backgroundColor: 'hsl(210 40% 98%)', padding: '4rem 2rem' }, children: ['testimonials-title', 'testimonials-grid'] },
      'testimonials-title': { id: 'testimonials-title', type: 'Text', props: { text: 'What Our Customers Say', level: 'h2' }, style: { fontSize: '1.25rem', fontWeight: '600', textAlign: 'center', margin: '0 0 2.5rem 0' }, children: [] },
      'testimonials-grid': { id: 'testimonials-grid', type: 'Grid', props: { columns: 3 }, style: { gap: '2rem', maxWidth: '72rem', margin: '0 auto' }, children: ['testimonial-1', 'testimonial-2', 'testimonial-3'] },
      'testimonial-1': { id: 'testimonial-1', type: 'Card', props: { items: [{ title: '★★★★★', description: '"The quality is incredible. Every piece feels like it was made just for me."\n\n— Emily R.' }] }, style: { padding: '1.5rem', backgroundColor: '#fff', borderRadius: '0.5rem' }, children: [] },
      'testimonial-2': { id: 'testimonial-2', type: 'Card', props: { items: [{ title: '★★★★★', description: '"Fast shipping, beautiful packaging, and the products exceeded my expectations."\n\n— David K.' }] }, style: { padding: '1.5rem', backgroundColor: '#fff', borderRadius: '0.5rem' }, children: [] },
      'testimonial-3': { id: 'testimonial-3', type: 'Card', props: { items: [{ title: '★★★★★', description: '"I\'ve been a loyal customer for a year now. Wouldn\'t shop anywhere else."\n\n— Lisa M.' }] }, style: { padding: '1.5rem', backgroundColor: '#fff', borderRadius: '0.5rem' }, children: [] },
      'newsletter-section': { id: 'newsletter-section', type: 'Section', props: {}, style: { backgroundColor: 'hsl(210 40% 96.1%)', padding: '4rem 2rem', textAlign: 'center' }, children: ['newsletter-title', 'newsletter-subtitle', 'newsletter-form'] },
      'newsletter-title': { id: 'newsletter-title', type: 'Text', props: { text: 'Stay in the loop', level: 'h2' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1rem 0' }, children: [] },
      'newsletter-subtitle': { id: 'newsletter-subtitle', type: 'Text', props: { text: 'Subscribe to our newsletter for new product launches, exclusive offers, and style inspiration.', level: 'p' }, style: { fontSize: '0.875rem', color: '#888', maxWidth: '28rem', margin: '0 auto 1.5rem', lineHeight: '1.5' }, children: [] },
      'newsletter-form': { id: 'newsletter-form', type: 'Container', props: {}, style: { display: 'flex', gap: '0.5rem', maxWidth: '24rem', margin: '0 auto' }, children: ['newsletter-button'] },
      'newsletter-button': { id: 'newsletter-button', type: 'Button', props: { text: 'Subscribe', href: '#' }, style: { padding: '0.625rem 1.5rem', backgroundColor: '#111', color: '#fff', borderRadius: '0.375rem', fontSize: '0.875rem' }, children: [] },
      ...sharedFooter(),
    },
  };
}

// ─── PRODUCTS ───
export function createProductsSchema(): Schema {
  return {
    id: 'schema-products', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '2rem', maxWidth: '80rem', margin: '0 auto', width: '100%' }, children: ['page-title', 'products-layout'] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'All Products', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1.5rem 0' }, children: [] },
      'products-layout': { id: 'products-layout', type: 'Container', props: {}, style: { display: 'flex', gap: '2rem' }, children: ['sidebar', 'products-grid'] },
      sidebar: { id: 'sidebar', type: 'Section', props: {}, style: { width: '14rem' }, children: ['filter-title', 'filter-categories'] },
      'filter-title': { id: 'filter-title', type: 'Text', props: { text: 'Filters', level: 'h3' }, style: { fontSize: '0.875rem', fontWeight: '600', margin: '0 0 1rem 0' }, children: [] },
      'filter-categories': { id: 'filter-categories', type: 'Card', props: { items: [{ title: 'Categories', description: 'Electronics • Clothing • Accessories • Home & Garden' }] }, style: { padding: '1rem', borderRadius: '0.5rem' }, children: [] },
      'products-grid': { id: 'products-grid', type: 'Grid', props: { columns: 3 }, style: { gap: '1.5rem' }, children: ['product-1', 'product-2', 'product-3', 'product-4', 'product-5', 'product-6'] },
      ...productCardNodes('product-1', { name: 'Minimal Watch', price: '$249', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', badge: 'New' }).nodes,
      ...productCardNodes('product-2', { name: 'Leather Bag', price: '$189', originalPrice: '$249', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' }).nodes,
      ...productCardNodes('product-3', { name: 'Wireless Earbuds', price: '$129', image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop' }).nodes,
      ...productCardNodes('product-4', { name: 'Sunglasses', price: '$159', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', badge: 'Sale' }).nodes,
      ...productCardNodes('product-5', { name: 'Headphones', price: '$299', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' }).nodes,
      ...productCardNodes('product-6', { name: 'Smart Speaker', price: '$99', image: 'https://images.unsplash.com/photo-1543512214-318228f4a704?w=400&h=400&fit=crop' }).nodes,
      ...sharedFooter(),
    },
  };
}

// ─── FAQ ───
export function createFAQSchema(): Schema {
  const faqs = [
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay.' },
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery.' },
    { q: 'What is your return policy?', a: 'We offer a 30-day return policy for unused items in their original packaging. Returns are free for domestic orders.' },
    { q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries. International shipping typically takes 7-14 business days.' },
    { q: 'How do I track my order?', a: "Once your order ships, you'll receive an email with a tracking number and link to track your package in real-time." },
    { q: 'Can I modify my order after placing it?', a: 'Orders can be modified within 1 hour of placement. Please contact our support team for assistance.' },
    { q: 'Do you offer gift wrapping?', a: 'Yes, we offer complimentary gift wrapping on all orders. You can select this option during checkout.' },
    { q: 'What is your warranty policy?', a: 'All products come with a 2-year warranty against manufacturing defects. Contact us for warranty claims.' },
  ];
  const ids = faqs.map((_, i) => `faq-item-${i}`);
  const nodes: Nodes = {};
  faqs.forEach((item, i) => {
    nodes[`faq-item-${i}`] = { id: `faq-item-${i}`, type: 'Card', props: { items: [{ title: item.q, description: item.a }] }, style: { padding: '1.25rem', borderRadius: '0.5rem', margin: '0 0 0.5rem 0', borderWidth: '1px', borderColor: '#eee' }, children: [] };
  });
  return {
    id: 'schema-faq', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '4rem 2rem', maxWidth: '48rem', margin: '0 auto', width: '100%' }, children: ['page-header', 'faq-list'] },
      'page-header': { id: 'page-header', type: 'Container', props: {}, style: { textAlign: 'center', margin: '0 0 3rem 0' }, children: ['page-title', 'page-subtitle'] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'Frequently Asked Questions', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }, children: [] },
      'page-subtitle': { id: 'page-subtitle', type: 'Text', props: { text: 'Everything you need to know.', level: 'p' }, style: { fontSize: '0.875rem', color: '#888' }, children: [] },
      'faq-list': { id: 'faq-list', type: 'Container', props: {}, style: { display: 'flex', flexDirection: 'column' }, children: ids },
      ...nodes,
      ...sharedFooter(),
    },
  };
}

// ─── CONTACT ───
export function createContactSchema(): Schema {
  return {
    id: 'schema-contact', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '4rem 2rem', maxWidth: '48rem', margin: '0 auto', width: '100%' }, children: ['page-header', 'contact-grid'] },
      'page-header': { id: 'page-header', type: 'Container', props: {}, style: { textAlign: 'center', margin: '0 0 3rem 0' }, children: ['page-title', 'page-subtitle'] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'Contact Us', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }, children: [] },
      'page-subtitle': { id: 'page-subtitle', type: 'Text', props: { text: "We'd love to hear from you.", level: 'p' }, style: { fontSize: '0.875rem', color: '#888' }, children: [] },
      'contact-grid': { id: 'contact-grid', type: 'Grid', props: { columns: 2 }, style: { gap: '3rem' }, children: ['contact-form-area', 'contact-info'] },
      'contact-form-area': { id: 'contact-form-area', type: 'Card', props: { items: [{ title: 'Send us a message', description: "Fill out the form and we'll get back to you within 24 hours." }] }, style: { padding: '1.5rem', borderRadius: '0.5rem' }, children: [] },
      'contact-info': { id: 'contact-info', type: 'Container', props: {}, style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' }, children: ['info-email', 'info-phone', 'info-address'] },
      'info-email': { id: 'info-email', type: 'Card', props: { items: [{ title: '📧 Email', description: 'support@store.com' }] }, style: { padding: '1rem' }, children: [] },
      'info-phone': { id: 'info-phone', type: 'Card', props: { items: [{ title: '📞 Phone', description: '+1 (555) 123-4567' }] }, style: { padding: '1rem' }, children: [] },
      'info-address': { id: 'info-address', type: 'Card', props: { items: [{ title: '📍 Address', description: '123 Commerce St\nNew York, NY 10001' }] }, style: { padding: '1rem' }, children: [] },
      ...sharedFooter(),
    },
  };
}

// ─── HELP CENTER ───
export function createHelpSchema(): Schema {
  const topics = [
    { icon: '🚚', title: 'Shipping & Delivery', desc: 'Track orders, shipping times, and delivery info.' },
    { icon: '🔄', title: 'Returns & Exchanges', desc: 'Learn about our 30-day return policy.' },
    { icon: '💳', title: 'Payment & Billing', desc: 'Payment methods, invoices, and refunds.' },
    { icon: '❓', title: 'Product Information', desc: 'Sizing guides, materials, and care instructions.' },
    { icon: '🛡️', title: 'Warranty', desc: 'Coverage details and how to make a claim.' },
    { icon: '✉️', title: 'Contact Us', desc: 'Get in touch with our support team.' },
  ];
  const ids = topics.map((_, i) => `help-topic-${i}`);
  const nodes: Nodes = {};
  topics.forEach((t, i) => {
    nodes[`help-topic-${i}`] = { id: `help-topic-${i}`, type: 'Card', props: { items: [{ title: `${t.icon} ${t.title}`, description: t.desc }] }, style: { padding: '1.5rem', borderRadius: '0.5rem', borderWidth: '1px', borderColor: '#eee' }, children: [] };
  });
  return {
    id: 'schema-help', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '4rem 2rem', maxWidth: '48rem', margin: '0 auto', width: '100%' }, children: ['page-header', 'help-grid'] },
      'page-header': { id: 'page-header', type: 'Container', props: {}, style: { textAlign: 'center', margin: '0 0 3rem 0' }, children: ['page-title', 'page-subtitle'] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'Help Center', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }, children: [] },
      'page-subtitle': { id: 'page-subtitle', type: 'Text', props: { text: 'How can we help you today?', level: 'p' }, style: { fontSize: '0.875rem', color: '#888' }, children: [] },
      'help-grid': { id: 'help-grid', type: 'Grid', props: { columns: 3 }, style: { gap: '1rem' }, children: ids },
      ...nodes,
      ...sharedFooter(),
    },
  };
}

// ─── PRIVACY ───
export function createPrivacySchema(): Schema {
  const sections = [
    { title: '1. Information We Collect', content: 'We collect information you provide directly, including your name, email address, shipping address, and payment information when you make a purchase.' },
    { title: '2. How We Use Your Information', content: 'We use your information to process orders, provide customer support, send promotional communications (with your consent), and improve our services.' },
    { title: '3. Information Sharing', content: 'We do not sell your personal information. We share data only with service providers necessary to fulfill your orders and operate our business.' },
    { title: '4. Data Security', content: 'We implement industry-standard security measures to protect your personal information, including encryption and secure data storage.' },
    { title: '5. Your Rights', content: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@store.com for any requests.' },
    { title: '6. Contact', content: 'For questions about this policy, email us at privacy@store.com.' },
  ];
  const sectionIds = sections.map((_, i) => `privacy-section-${i}`);
  const nodes: Nodes = {};
  sections.forEach((s, i) => {
    nodes[`privacy-section-${i}`] = { id: `privacy-section-${i}`, type: 'Container', props: {}, style: { margin: '0 0 2rem 0' }, children: [`privacy-title-${i}`, `privacy-text-${i}`] };
    nodes[`privacy-title-${i}`] = { id: `privacy-title-${i}`, type: 'Text', props: { text: s.title, level: 'h2' }, style: { fontSize: '1.125rem', fontWeight: '500', margin: '0 0 0.75rem 0' }, children: [] };
    nodes[`privacy-text-${i}`] = { id: `privacy-text-${i}`, type: 'Text', props: { text: s.content, level: 'p' }, style: { fontSize: '0.875rem', color: '#888', lineHeight: '1.6' }, children: [] };
  });
  return {
    id: 'schema-privacy', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '4rem 2rem', maxWidth: '48rem', margin: '0 auto', width: '100%' }, children: ['page-title', 'page-updated', ...sectionIds] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'Privacy Policy', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }, children: [] },
      'page-updated': { id: 'page-updated', type: 'Text', props: { text: 'Last updated: March 1, 2026', level: 'p' }, style: { fontSize: '0.875rem', color: '#888', margin: '0 0 2rem 0' }, children: [] },
      ...nodes,
      ...sharedFooter(),
    },
  };
}

// ─── TERMS ───
export function createTermsSchema(): Schema {
  const sections = [
    { title: '1. General Terms', content: 'By accessing and using this website, you accept these terms and conditions in full. Do not continue to use the website if you do not agree to all the terms.' },
    { title: '2. Products & Pricing', content: 'All prices are in USD and subject to change without notice. We reserve the right to modify or discontinue any product without prior notice.' },
    { title: '3. Orders & Payment', content: 'All orders are subject to acceptance and availability. Payment is processed securely at the time of purchase.' },
    { title: '4. Shipping & Delivery', content: 'We offer standard and express shipping options. Delivery times are estimates and may vary based on location.' },
    { title: '5. Returns & Refunds', content: 'Items may be returned within 30 days of delivery in original, unused condition. Refunds are processed within 5-7 business days.' },
    { title: '6. Limitation of Liability', content: 'We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.' },
  ];
  const sectionIds = sections.map((_, i) => `terms-section-${i}`);
  const nodes: Nodes = {};
  sections.forEach((s, i) => {
    nodes[`terms-section-${i}`] = { id: `terms-section-${i}`, type: 'Container', props: {}, style: { margin: '0 0 2rem 0' }, children: [`terms-title-${i}`, `terms-text-${i}`] };
    nodes[`terms-title-${i}`] = { id: `terms-title-${i}`, type: 'Text', props: { text: s.title, level: 'h2' }, style: { fontSize: '1.125rem', fontWeight: '500', margin: '0 0 0.75rem 0' }, children: [] };
    nodes[`terms-text-${i}`] = { id: `terms-text-${i}`, type: 'Text', props: { text: s.content, level: 'p' }, style: { fontSize: '0.875rem', color: '#888', lineHeight: '1.6' }, children: [] };
  });
  return {
    id: 'schema-terms', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '4rem 2rem', maxWidth: '48rem', margin: '0 auto', width: '100%' }, children: ['page-title', 'page-updated', ...sectionIds] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'Terms & Conditions', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }, children: [] },
      'page-updated': { id: 'page-updated', type: 'Text', props: { text: 'Last updated: March 1, 2026', level: 'p' }, style: { fontSize: '0.875rem', color: '#888', margin: '0 0 2rem 0' }, children: [] },
      ...nodes,
      ...sharedFooter(),
    },
  };
}

// ─── WISHLIST ───
export function createWishlistSchema(): Schema {
  return {
    id: 'schema-wishlist', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: defaultThemeTokens(), rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section', props: {}, style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: ['navbar', 'page-content', 'footer'] },
      ...sharedNavbar(),
      'page-content': { id: 'page-content', type: 'Section', props: {}, style: { padding: '2rem', maxWidth: '80rem', margin: '0 auto', width: '100%' }, children: ['page-title', 'wishlist-empty'] },
      'page-title': { id: 'page-title', type: 'Text', props: { text: 'Wishlist', level: 'h1' }, style: { fontSize: '1.5rem', fontWeight: '600', margin: '0 0 2rem 0' }, children: [] },
      'wishlist-empty': { id: 'wishlist-empty', type: 'Container', props: {}, style: { textAlign: 'center', padding: '5rem 0' }, children: ['wishlist-icon', 'wishlist-text', 'wishlist-cta'] },
      'wishlist-icon': { id: 'wishlist-icon', type: 'Text', props: { text: '♡', level: 'p' }, style: { fontSize: '3rem', color: '#888', margin: '0 0 1rem 0' }, children: [] },
      'wishlist-text': { id: 'wishlist-text', type: 'Text', props: { text: 'Your wishlist is empty.', level: 'p' }, style: { color: '#888', margin: '0 0 1rem 0' }, children: [] },
      'wishlist-cta': { id: 'wishlist-cta', type: 'Button', props: { text: 'Browse Products', href: '/products' }, style: { padding: '0.75rem 2rem', backgroundColor: '#111', color: '#fff', borderRadius: '0.375rem', fontSize: '0.875rem' }, children: [] },
      ...sharedFooter(),
    },
  };
}

// ─── PAGE DEFINITIONS ───
export interface PageSchemaDefinition {
  slug: string;
  title: string;
  getDefaultSchema: () => Schema;
}

export const PAGE_DEFINITIONS: PageSchemaDefinition[] = [
  { slug: '/', title: 'Inicio (Home)', getDefaultSchema: createHomeSchema },
  { slug: '/products', title: 'Tienda (Products)', getDefaultSchema: createProductsSchema },
  { slug: '/faq', title: 'FAQ', getDefaultSchema: createFAQSchema },
  { slug: '/contact', title: 'Contacto', getDefaultSchema: createContactSchema },
  { slug: '/help', title: 'Centro de Ayuda', getDefaultSchema: createHelpSchema },
  { slug: '/privacy', title: 'Política de Privacidad', getDefaultSchema: createPrivacySchema },
  { slug: '/terms', title: 'Términos y Condiciones', getDefaultSchema: createTermsSchema },
  { slug: '/wishlist', title: 'Lista de Deseos', getDefaultSchema: createWishlistSchema },
];

export function getDefaultSchemaForSlug(slug: string): Schema {
  const def = PAGE_DEFINITIONS.find((p) => p.slug === slug);
  return def ? def.getDefaultSchema() : createHomeSchema();
}
