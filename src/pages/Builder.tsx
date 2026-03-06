import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SchemaStore } from '@/lib/schema-store';
import { Schema } from '@/types/schema';
import { BuilderEditorShell } from '@/components/builder/BuilderEditorShell';

export default function Builder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pageSlug = searchParams.get('page') || 'home';

  const [initialSchema, setInitialSchema] = useState<Schema | null>(null);

  useEffect(() => {
    SchemaStore.init();
    const page = SchemaStore.getPageBySlug(pageSlug);
    if (page) {
      const s = SchemaStore.getSchema(page.schemaId);
      if (s) setInitialSchema(s);
    }
  }, [pageSlug]);

  if (!initialSchema) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading builder...</p>
      </div>
    );
  }

  return (
    <BuilderEditorShell
      key={initialSchema.id}
      initialSchema={initialSchema}
      onSave={(schema) => {
        SchemaStore.saveSchema(schema);
      }}
      onPreview={() => navigate(`/preview?page=${pageSlug}`)}
      onExport={() => navigate(`/admin/export?page=${pageSlug}`)}
    />
  );
}
