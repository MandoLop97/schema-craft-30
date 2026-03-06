import { useMemo } from 'react';
import { Schema } from '@/types/schema';
import { createDefaultHomeSchema } from '@/lib/default-schema';
import { validateSchema } from '@/lib/schema-validator';
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
  // Prioritize external schema; fallback to demo only when none provided.
  const { resolvedSchema, validationErrors } = useMemo(() => {
    const raw = initialSchema ?? createDefaultHomeSchema().schema;
    const result = validateSchema(raw);

    if (result.errors.length > 0) {
      console.warn('[NexoraBuilder] Schema validation warnings:', result.errors);
    }

    return {
      resolvedSchema: result.schema ?? createDefaultHomeSchema().schema,
      validationErrors: result.schema ? [] : result.errors,
    };
  }, [initialSchema]);

  // Fatal validation error — show error instead of crashing
  if (validationErrors.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md space-y-3 text-center">
          <h2 className="text-lg font-semibold text-destructive">Invalid Schema</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            {validationErrors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Please provide a valid schema with a rootNodeId that exists in nodes.
          </p>
        </div>
      </div>
    );
  }

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
