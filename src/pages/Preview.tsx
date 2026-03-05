import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SchemaStore } from '@/lib/schema-store';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema } from '@/types/schema';

const Preview = () => {
  const [searchParams] = useSearchParams();
  const [schema, setSchema] = useState<Schema | null>(null);
  const slug = searchParams.get('page') || 'home';

  useEffect(() => {
    SchemaStore.init();
    const page = SchemaStore.getPageBySlug(slug);
    if (page) {
      const s = SchemaStore.getSchema(page.schemaId);
      if (s) setSchema(s);
    }
  }, [slug]);

  if (!schema) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return <PageRenderer schema={schema} mode="preview" />;
};

export default Preview;
