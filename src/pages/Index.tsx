import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema, PageDefinition } from '@/types/schema';

/** Remove Navbar/Footer root nodes from a page schema to avoid duplicates with global header/footer */
function stripSiteNodes(schema: Schema, hasHeader: boolean, hasFooter: boolean): Schema {
  if (!hasHeader && !hasFooter) return schema;
  const siteTypes = new Set<string>();
  if (hasHeader) { siteTypes.add('Navbar'); siteTypes.add('AnnouncementBar'); }
  if (hasFooter) siteTypes.add('Footer');

  const rootNode = schema.nodes[schema.rootNodeId];
  if (!rootNode?.children) return schema;

  const removedIds = new Set(
    rootNode.children.filter(id => {
      const node = schema.nodes[id];
      return node && siteTypes.has(node.type);
    })
  );

  if (removedIds.size === 0) return schema;

  const newNodes = { ...schema.nodes };
  newNodes[schema.rootNodeId] = {
    ...rootNode,
    children: rootNode.children.filter(id => !removedIds.has(id)),
  };
  removedIds.forEach(id => delete newNodes[id]);

  return { ...schema, nodes: newNodes };
}

interface PublishedContent {
  pages: Array<{
    slug: string;
    title: string;
    schema: Schema;
    templateType: string;
    category: string;
  }>;
}

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

      const { data } = await supabase
        .from('published_pages')
        .select('content_json')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (!data?.content_json) {
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

  const cleanPageSchema = useMemo(() => {
    if (!pageSchema) return null;
    return stripSiteNodes(pageSchema, !!headerSchema, !!footerSchema);
  }, [pageSchema, headerSchema, footerSchema]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (notFound || !cleanPageSchema) {
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
        <PageRenderer schema={cleanPageSchema} mode="public" />
      </div>
      {footerSchema && <PageRenderer schema={footerSchema} mode="public" />}
    </div>
  );
};

export default Index;
