import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema } from '@/types/schema';

/**
 * Preview page — renders draft content directly from page_schemas (Supabase).
 * Composes: Header + Page Content + Footer
 * Route: /preview or /preview/:slug
 */
const Preview = () => {
  const { slug } = useParams<{ slug: string }>();
  const pageSlug = slug || 'home';

  const [pageSchema, setPageSchema] = useState<Schema | null>(null);
  const [headerSchema, setHeaderSchema] = useState<Schema | null>(null);
  const [footerSchema, setFooterSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchemas() {
      setLoading(true);
      setNotFound(false);

      // Fetch page, header, and footer in parallel
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

    fetchSchemas();
    return () => { cancelled = true; };
  }, [pageSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Cargando preview...</div>
      </div>
    );
  }

  if (notFound || !pageSchema) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
          <p className="text-muted-foreground">No se encontró el esquema para "{pageSlug}"</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {headerSchema && <PageRenderer schema={headerSchema} mode="preview" />}
      <div style={{ flex: 1 }}>
        <PageRenderer schema={pageSchema} mode="preview" />
      </div>
      {footerSchema && <PageRenderer schema={footerSchema} mode="preview" />}
    </div>
  );
};

export default Preview;
