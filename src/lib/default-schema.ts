import { Schema, Page } from '@/types/schema';

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function createDefaultHomeSchema(): { page: Page; schema: Schema } {
  const ids = {
    root: 'root',
    navbar: 'navbar',
    hero: 'hero-section',
    heroContainer: 'hero-container',
    heroTitle: 'hero-title',
    heroSubtitle: 'hero-subtitle',
    heroCta: 'hero-cta',
    productsSection: 'products-section',
    productsTitle: 'products-title',
    productsGrid: 'products-grid',
    product1: 'product-1',
    product2: 'product-2',
    product3: 'product-3',
    product4: 'product-4',
    valueSection: 'value-section',
    valueTitle: 'value-title',
    valueGrid: 'value-grid',
    value1: 'value-1',
    value2: 'value-2',
    value3: 'value-3',
    footer: 'footer',
  };

  const schemaId = 'schema-home';

  const schema: Schema = {
    id: schemaId,
    version: 1,
    updatedAt: new Date().toISOString(),
    themeTokens: {
      colors: {
        primary: '222.2 47.4% 11.2%',
        secondary: '210 40% 96.1%',
        background: '0 0% 100%',
        text: '222.2 84% 4.9%',
        muted: '215.4 16.3% 46.9%',
        border: '214.3 31.8% 91.4%',
        accent: '210 40% 96.1%',
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        baseSize: '16px',
        headingScale: 1.25,
      },
      radius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '4rem' },
    },
    rootNodeId: ids.root,
    nodes: {
      [ids.root]: {
        id: ids.root,
        type: 'Section',
        props: {},
        style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
        children: [ids.navbar, ids.hero, ids.productsSection, ids.valueSection, ids.footer],
      },
      [ids.navbar]: {
        id: ids.navbar,
        type: 'Navbar',
        props: {
          logoText: 'NEXORA',
          links: [
            { text: 'Shop', href: '#' },
            { text: 'Collections', href: '#' },
            { text: 'About', href: '#' },
            { text: 'Contact', href: '#' },
          ],
        },
        style: {},
        children: [],
      },
      [ids.hero]: {
        id: ids.hero,
        type: 'Section',
        props: {},
        style: {
          padding: '6rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'hsl(210 40% 96.1%)',
          minHeight: '70vh',
        },
        children: [ids.heroContainer],
      },
      [ids.heroContainer]: {
        id: ids.heroContainer,
        type: 'Container',
        props: {},
        style: { maxWidth: '48rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' },
        children: [ids.heroTitle, ids.heroSubtitle, ids.heroCta],
      },
      [ids.heroTitle]: {
        id: ids.heroTitle,
        type: 'Text',
        props: { text: 'Elevate Your Style', level: 'h1' },
        style: { fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em' },
        children: [],
      },
      [ids.heroSubtitle]: {
        id: ids.heroSubtitle,
        type: 'Text',
        props: { text: 'Discover curated collections designed for the modern lifestyle. Premium quality, timeless design.', level: 'p' },
        style: { fontSize: '1.25rem', color: 'hsl(215.4 16.3% 46.9%)', maxWidth: '32rem', lineHeight: '1.6' },
        children: [],
      },
      [ids.heroCta]: {
        id: ids.heroCta,
        type: 'Button',
        props: { text: 'Explore Collection', variant: 'default' },
        style: { padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '0.5rem' },
        children: [],
      },
      [ids.productsSection]: {
        id: ids.productsSection,
        type: 'Section',
        props: {},
        style: { padding: '5rem 2rem' },
        children: [ids.productsTitle, ids.productsGrid],
      },
      [ids.productsTitle]: {
        id: ids.productsTitle,
        type: 'Text',
        props: { text: 'Featured Products', level: 'h2' },
        style: { fontSize: '2rem', fontWeight: '600', textAlign: 'center', margin: '0 0 3rem 0' },
        children: [],
      },
      [ids.productsGrid]: {
        id: ids.productsGrid,
        type: 'Grid',
        props: { columns: 4 },
        style: { gap: '1.5rem', maxWidth: '72rem', margin: '0 auto' },
        children: [ids.product1, ids.product2, ids.product3, ids.product4],
      },
      [ids.product1]: {
        id: ids.product1,
        type: 'ProductCard',
        props: { text: 'Minimal Watch', price: '$249', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', badge: 'New' },
        style: {},
        children: [],
      },
      [ids.product2]: {
        id: ids.product2,
        type: 'ProductCard',
        props: { text: 'Leather Bag', price: '$189', originalPrice: '$249', src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' },
        style: {},
        children: [],
      },
      [ids.product3]: {
        id: ids.product3,
        type: 'ProductCard',
        props: { text: 'Wireless Earbuds', price: '$129', src: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop' },
        style: {},
        children: [],
      },
      [ids.product4]: {
        id: ids.product4,
        type: 'ProductCard',
        props: { text: 'Sunglasses', price: '$159', src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', badge: 'Sale' },
        style: {},
        children: [],
      },
      [ids.valueSection]: {
        id: ids.valueSection,
        type: 'Section',
        props: {},
        style: { padding: '5rem 2rem', backgroundColor: 'hsl(210 40% 96.1%)' },
        children: [ids.valueTitle, ids.valueGrid],
      },
      [ids.valueTitle]: {
        id: ids.valueTitle,
        type: 'Text',
        props: { text: 'Why Choose Us', level: 'h2' },
        style: { fontSize: '2rem', fontWeight: '600', textAlign: 'center', margin: '0 0 3rem 0' },
        children: [],
      },
      [ids.valueGrid]: {
        id: ids.valueGrid,
        type: 'Grid',
        props: { columns: 3 },
        style: { gap: '2rem', maxWidth: '64rem', margin: '0 auto' },
        children: [ids.value1, ids.value2, ids.value3],
      },
      [ids.value1]: {
        id: ids.value1,
        type: 'Card',
        props: {
          items: [{ icon: 'truck', title: 'Free Shipping', description: 'Free shipping on all orders over $50. Fast and reliable delivery worldwide.' }],
        },
        style: { padding: '2rem', textAlign: 'center' },
        children: [],
      },
      [ids.value2]: {
        id: ids.value2,
        type: 'Card',
        props: {
          items: [{ icon: 'shield', title: 'Secure Payments', description: 'Your payment information is always protected with bank-level encryption.' }],
        },
        style: { padding: '2rem', textAlign: 'center' },
        children: [],
      },
      [ids.value3]: {
        id: ids.value3,
        type: 'Card',
        props: {
          items: [{ icon: 'refresh', title: 'Easy Returns', description: '30-day hassle-free return policy. No questions asked.' }],
        },
        style: { padding: '2rem', textAlign: 'center' },
        children: [],
      },
      [ids.footer]: {
        id: ids.footer,
        type: 'Footer',
        props: {
          logoText: 'NEXORA',
          copyright: '© 2026 Nexora. All rights reserved.',
          links: [
            { text: 'Privacy Policy', href: '#' },
            { text: 'Terms of Service', href: '#' },
            { text: 'Support', href: '#' },
          ],
        },
        style: {},
        children: [],
      },
    },
  };

  const page: Page = {
    id: 'page-home',
    slug: 'home',
    name: 'Home',
    schemaId,
  };

  return { page, schema };
}
