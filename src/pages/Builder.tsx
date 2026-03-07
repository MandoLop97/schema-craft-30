import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productCardNodes } from '@/lib/default-schemas';
import { NexoraBuilderApp } from '@/NexoraBuilderApp';
import { supabase } from '@/integrations/supabase/client';
import { PublishPayload } from '@/components/builder/PublishDialog';
import { PageDefinition, Schema } from '@/types/schema';
import { createHomeSchema, createProductsSchema } from '@/lib/default-schemas';
import { createDefaultHomeSchema } from '@/lib/default-schema';
import { toast } from 'sonner';

/* ── Header schema ── */
function createHeaderSchema() {
  const home = createHomeSchema();
  const navbar = home.nodes['navbar'];
  return {
    id: 'schema-header', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: home.themeTokens, rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section' as const, props: {}, style: { display: 'flex', flexDirection: 'column' }, children: ['navbar'] },
      navbar: navbar ? { ...navbar } : { id: 'navbar', type: 'Navbar' as const, props: { logoText: 'STORE', links: [{ text: 'Home', href: '#' }, { text: 'Shop', href: '#' }] }, style: {}, children: [] },
    },
  };
}

/* ── Footer schema ── */
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

/* ── Product card schema ── */
function createProductCardSchema() {
  const { rootId, nodes: cardNodes } = productCardNodes('card', {
    name: 'Demo Product', price: '$29.99', originalPrice: '$49.99', badge: 'New',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  });
  return {
    id: 'schema-product-card', version: 1, updatedAt: new Date().toISOString(),
    themeTokens: createDefaultHomeSchema().schema.themeTokens, rootNodeId: 'root',
    nodes: {
      root: { id: 'root', type: 'Section' as const, props: {}, style: { display: 'flex', flexDirection: 'column', padding: '1rem' }, children: [rootId] },
      ...cardNodes,
    },
  };
}

/* ── Default seed pages ── */
const DEFAULT_PAGES: Array<{
  slug: string; title: string; schema: any; templateType: string; category: string;
  canvasSize?: { width: number; height: number }; mockData?: any;
}> = [
  { slug: 'home', title: 'Home', schema: createHomeSchema(), templateType: 'page', category: 'Páginas' },
  { slug: 'products', title: 'Products', schema: createProductsSchema(), templateType: 'page', category: 'Páginas' },
  { slug: '__global/header', title: 'Header', schema: createHeaderSchema(), templateType: 'header', category: 'Elementos Globales' },
  { slug: '__global/footer', title: 'Footer', schema: createFooterSchema(), templateType: 'footer', category: 'Elementos Globales' },
  {
    slug: '__template/product-card', title: 'Product Card', schema: createProductCardSchema(),
    templateType: 'component', category: 'Templates',
    canvasSize: { width: 400, height: 620 },
    mockData: { product: { name: 'Demo Product', price: 29.99, image: '/placeholder.svg', rating: 4.5 } },
  },
];

export default function Builder() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('');
  const [pages, setPages] = useState<PageDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Load pages from DB, seed defaults if empty ── */
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('page_schemas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading page_schemas:', error);
        toast.error('Error al cargar esquemas');
        setLoading(false);
        return;
      }

      const existingSlugs = new Set((data || []).map((r: any) => r.slug));

      // Seed any missing default pages
      const missing = DEFAULT_PAGES.filter((p) => !existingSlugs.has(p.slug));
      if (missing.length > 0) {
        const rows = missing.map((p) => ({
          slug: p.slug,
          title: p.title,
          schema_json: p.schema as any,
          template_type: p.templateType,
          category: p.category,
          canvas_size: p.canvasSize ?? null,
          mock_data: p.mockData ?? null,
        }));
        const { error: seedErr } = await supabase.from('page_schemas').insert(rows);
        if (seedErr) {
          console.error('Error seeding missing pages:', seedErr);
        }
      }

      // Combine existing DB rows + freshly seeded missing pages
      const allPages: PageDefinition[] = [
        ...(data || []).map((row: any) => ({
          slug: row.slug,
          title: row.title,
          schema: row.schema_json as Schema,
          templateType: row.template_type as any,
          category: row.category,
          canvasSize: row.canvas_size ?? undefined,
          mockData: row.mock_data ?? undefined,
        })),
        ...missing.map((p) => ({
          slug: p.slug,
          title: p.title,
          schema: p.schema as Schema,
          templateType: p.templateType as any,
          category: p.category,
          canvasSize: p.canvasSize,
          mockData: p.mockData,
        })),
      ];

      setPages(allPages);
      setLoading(false);
    }
    load();
  }, []);

  /* ── Save schema to DB on Guardar ── */
  const handleSave = useCallback(async (schema: Schema) => {
    if (!activePage) return;
    const { error } = await supabase
      .from('page_schemas')
      .update({ schema_json: schema as any })
      .eq('slug', activePage);

    if (error) {
      console.error('Error saving schema:', error);
      toast.error('Error al guardar');
    } else {
      // Update local state so the page reflects saved data
      setPages((prev) => prev.map((p) => p.slug === activePage ? { ...p, schema } : p));
      toast.success('Esquema guardado correctamente');
    }
  }, [activePage]);

  const handleSaveWithSlug = useCallback(async (slug: string, schema: Schema) => {
    const { error } = await supabase
      .from('page_schemas')
      .update({ schema_json: schema as any })
      .eq('slug', slug);

    if (error) {
      console.error('Error saving schema:', error);
      toast.error('Error al guardar');
    } else {
      setPages((prev) => prev.map((p) => p.slug === slug ? { ...p, schema } : p));
      toast.success('Esquema guardado correctamente');
    }
  }, []);

  const handlePublishSubmit = async (payload: PublishPayload) => {
    // Bundle ALL page schemas for publishing
    const { data: allPages } = await supabase
      .from('page_schemas')
      .select('slug, title, schema_json, template_type, category')
      .order('created_at', { ascending: true });

    const bundledContent = {
      pages: (allPages || []).map((row: any) => ({
        slug: row.slug,
        title: row.title,
        schema: row.schema_json,
        templateType: row.template_type,
        category: row.category,
      })),
      publishedAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('published_pages')
      .upsert(
        { domain: payload.domain, content_json: bundledContent as any, status: payload.mode },
        { onConflict: 'domain' }
      );
    if (error) throw error;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Cargando constructor...</div>
      </div>
    );
  }

  return (
    <NexoraBuilderApp
      pages={pages}
      activePage={activePage}
      onPageChange={setActivePage}
      onSave={handleSave}
      onSaveWithSlug={handleSaveWithSlug}
      onPreview={() => navigate(`/preview?page=${activePage}`)}
      onExport={() => navigate(`/admin/export?page=${activePage}`)}
      onPublishSubmit={handlePublishSubmit}
    />
  );
}
