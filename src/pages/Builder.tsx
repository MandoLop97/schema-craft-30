import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NexoraBuilderApp } from '@/NexoraBuilderApp';
import { supabase } from '@/integrations/supabase/client';
import { PublishPayload } from '@/components/builder/PublishDialog';
import { PageDefinition } from '@/types/schema';
import { createHomeSchema, createProductsSchema } from '@/lib/default-schemas';
import { createDefaultHomeSchema } from '@/lib/default-schema';

/* ── Minimal header schema ── */
function createHeaderSchema() {
  return {
    id: 'schema-header', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: createDefaultHomeSchema().schema.themeTokens, rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section' as const, props: {}, style: { display: 'flex', flexDirection: 'column' }, children: ['navbar'] },
      navbar: { id: 'navbar', type: 'Navbar' as const, props: { logoText: 'STORE', links: [{ text: 'Home', href: '#' }, { text: 'Shop', href: '#' }] }, style: {}, children: [] },
    },
  };
}

/* ── Minimal footer schema ── */
function createFooterSchema() {
  return {
    id: 'schema-footer', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: createDefaultHomeSchema().schema.themeTokens, rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section' as const, props: {}, style: { display: 'flex', flexDirection: 'column' }, children: ['footer'] },
      footer: { id: 'footer', type: 'Footer' as const, props: { logoText: 'STORE', copyright: '© 2026', links: [{ text: 'Privacy', href: '#' }] }, style: {}, children: [] },
    },
  };
}

/* ── Minimal product card schema ── */
function createProductCardSchema() {
  return {
    id: 'schema-product-card', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: createDefaultHomeSchema().schema.themeTokens, rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section' as const, props: {}, style: { display: 'flex', flexDirection: 'column', padding: '1rem' }, children: ['card'] },
      card: { id: 'card', type: 'ProductCard' as const, props: { text: 'Demo Product', price: '$29.99', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }, style: {}, children: [] },
    },
  };
}

/* ── Demo pages spanning 3 categories ── */
const DEMO_PAGES: PageDefinition[] = [
  { slug: 'home', title: 'Home', schema: createHomeSchema(), templateType: 'page', category: 'Páginas' },
  { slug: 'products', title: 'Products', schema: createProductsSchema(), templateType: 'page', category: 'Páginas' },
  { slug: '__global/header', title: 'Header', schema: createHeaderSchema(), templateType: 'header', category: 'Elementos Globales' },
  { slug: '__global/footer', title: 'Footer', schema: createFooterSchema(), templateType: 'footer', category: 'Elementos Globales' },
  {
    slug: '__template/product-card', title: 'Product Card', schema: createProductCardSchema(),
    templateType: 'component', category: 'Templates',
    canvasSize: { width: 350, height: 450 },
    mockData: { product: { name: 'Demo Product', price: 29.99, image: '/placeholder.svg', rating: 4.5 } },
  },
];

export default function Builder() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('home');

  const handlePublishSubmit = async (payload: PublishPayload) => {
    const { error } = await supabase
      .from('published_pages')
      .upsert(
        { domain: payload.domain, content_json: payload.schema as any, status: payload.mode },
        { onConflict: 'domain' }
      );
    if (error) throw error;
  };

  return (
    <NexoraBuilderApp
      pages={DEMO_PAGES}
      activePage={activePage}
      onPageChange={setActivePage}
      onSave={(schema) => console.log('save', schema)}
      onSaveWithSlug={(slug, schema) => console.log('save', slug, schema)}
      onPreview={() => navigate(`/preview?page=${activePage}`)}
      onExport={() => navigate(`/admin/export?page=${activePage}`)}
      onPublishSubmit={handlePublishSubmit}
    />
  );
}
