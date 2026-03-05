import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SchemaStore } from '@/lib/schema-store';
import { Schema } from '@/types/schema';
import { Button } from '@/components/ui/button';

const ExportSchema = () => {
  const [searchParams] = useSearchParams();
  const [schema, setSchema] = useState<Schema | null>(null);
  const [copied, setCopied] = useState(false);
  const slug = searchParams.get('page') || 'home';

  useEffect(() => {
    SchemaStore.init();
    const page = SchemaStore.getPageBySlug(slug);
    if (page) {
      const s = SchemaStore.getSchema(page.schemaId);
      if (s) setSchema(s);
    }
  }, [slug]);

  const handleCopy = () => {
    if (!schema) return;
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Export Schema</h1>
            <p className="text-sm text-muted-foreground">Page: {slug}</p>
          </div>
          <Button onClick={handleCopy} variant={copied ? 'secondary' : 'default'}>
            {copied ? '✓ Copied' : 'Copy JSON'}
          </Button>
        </div>
        <pre className="overflow-auto rounded-lg border bg-muted p-4 text-sm text-foreground">
          {schema ? JSON.stringify(schema, null, 2) : 'Page not found'}
        </pre>
      </div>
    </div>
  );
};

export default ExportSchema;
