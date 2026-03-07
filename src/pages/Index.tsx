import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema, PageDefinition } from '@/types/schema';

interface PublishedContent {
  pages: Array<{
    slug: string;
    title: string;
    schema: Schema;
    templateType: string;
    category: string;
  }>;
}

/**
 * Public site — renders published content from published_pages (Supabase).
 * Composes: Header + Page Content + Footer
 * Route: / or /:slug
 */
const Index = () => {
  const { slug } = useParams<{ slug: string }>();
  const pageSlug = slug || 'home';

  const [pageSchema, setPageSchema] = useState<Schema | null>(null);
  const [headerSchema, setHeaderSchema] = useState<Schema | null>(null);
  const [footerSchema, setFooterSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPublished() {
      setLoading(true);
      setNotFound(false);

      // Fetch published content — we look for any domain with status 'published'
      const { data } = await supabase
        .from('published_pages')
        .select('content_json')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (!data?.content_json) {
        // No published site — fallback to drafts from page_schemas
        await fetchFromDrafts();
        return;
      }

      const content = data.content_json as unknown as PublishedContent;
      if (!content.pages || !Array.isArray(content.pages)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const page = content.pages.find((p) => p.slug === pageSlug);
      const header = content.pages.find((p) => p.slug === '__global/header');
      const footer = content.pages.find((p) => p.slug === '__global/footer');

      if (!page) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPageSchema(page.schema);
      setHeaderSchema(header?.schema || null);
      setFooterSchema(footer?.schema || null);
      setLoading(false);
    }

    async function fetchFromDrafts() {
      // Fallback: if nothing is published, show drafts (same as preview)
      const [pageRes, headerRes, footerRes] = await Promise.all([
        supabase.from('page_schemas').select('schema_json').eq('slug', pageSlug).maybeSingle(),
        supabase.from('page_schemas').select('schema_json').eq('slug', '__global/header').maybeSingle(),
        supabase.from('page_schemas').select('schema_json').eq('slug', '__global/footer').maybeSingle(),
      ]);

      if (cancelled) return;

      if (!pageRes.data?.schema_json) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPageSchema(pageRes.data.schema_json as unknown as Schema);
      setHeaderSchema(headerRes.data?.schema_json ? (headerRes.data.schema_json as unknown as Schema) : null);
      setFooterSchema(footerRes.data?.schema_json ? (footerRes.data.schema_json as unknown as Schema) : null);
      setLoading(false);
    }

    fetchPublished();
    return () => { cancelled = true; };
  }, [pageSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (notFound || !pageSchema) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
          <p className="text-muted-foreground">La página "{pageSlug}" no existe o no ha sido publicada.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {headerSchema && <PageRenderer schema={headerSchema} mode="public" />}
      <div style={{ flex: 1 }}>
        <PageRenderer schema={pageSchema} mode="public" />
      </div>
      {footerSchema && <PageRenderer schema={footerSchema} mode="public" />}
    </div>
  );
};

export default Index;
