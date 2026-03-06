import { useMemo } from 'react';
import { Schema } from '@/types/schema';
import { createDefaultHomeSchema } from '@/lib/default-schema';
import { BuilderEditorShell } from '@/components/builder/BuilderEditorShell';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export interface NexoraBuilderAppProps {
  /** Initial schema to edit. If omitted, a default home page schema is created. */
  initialSchema?: Schema;
  /** Domain context passed from the template. */
  domain?: string;
  /** Page slug context passed from the template. */
  pageSlug?: string;
  /** Called when the user clicks Save. Receives the current schema. */
  onSave?: (schema: Schema) => void;
  /** Called when the user clicks Publish. Receives the current schema. */
  onPublish?: (schema: Schema) => void;
  /** Called when the user clicks Preview. */
  onPreview?: (schema: Schema) => void;
  /** Called when the user clicks Export. */
  onExport?: (schema: Schema) => void;
  /** CSS class name applied to the root container. */
  className?: string;
}

export function NexoraBuilderApp({
  initialSchema,
  domain,
  pageSlug,
  onSave,
  onPublish,
  onPreview,
  onExport,
  className,
}: NexoraBuilderAppProps) {
  // Use external schema if provided; only fall back to default when none given.
  // Re-derive when the external reference changes (key forces remount).
  const resolvedSchema = useMemo<Schema>(() => {
    if (initialSchema) return initialSchema;
    return createDefaultHomeSchema().schema;
  }, [initialSchema]);

  return (
    <TooltipProvider>
      <Toaster />
      <BuilderEditorShell
        key={resolvedSchema.id}
        initialSchema={resolvedSchema}
        onSave={onSave || (() => {})}
        onPublish={onPublish}
        onPreview={onPreview}
        onExport={onExport}
        className={className}
      />
    </TooltipProvider>
  );
}
