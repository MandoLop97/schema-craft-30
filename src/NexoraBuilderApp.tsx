import { useState } from 'react';
import { Schema } from '@/types/schema';
import { createDefaultHomeSchema } from '@/lib/default-schema';
import { BuilderEditorShell } from '@/components/builder/BuilderEditorShell';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export interface NexoraBuilderAppProps {
  /** Initial schema to edit. If omitted, a default home page schema is created. */
  initialSchema?: Schema;
  /** Called when the user clicks Save. Receives the current schema. */
  onSave?: (schema: Schema) => void;
  /** Called when the user clicks Preview. */
  onPreview?: (schema: Schema) => void;
  /** Called when the user clicks Export. */
  onExport?: (schema: Schema) => void;
  /** CSS class name applied to the root container. */
  className?: string;
}

export function NexoraBuilderApp({
  initialSchema: externalSchema,
  onSave,
  onPreview,
  onExport,
  className,
}: NexoraBuilderAppProps) {
  const [schema0] = useState<Schema>(() => {
    if (externalSchema) return externalSchema;
    return createDefaultHomeSchema().schema;
  });

  return (
    <TooltipProvider>
      <Toaster />
      <BuilderEditorShell
        key={schema0.id}
        initialSchema={schema0}
        onSave={onSave || (() => {})}
        onPreview={onPreview}
        onExport={onExport}
        className={className}
      />
    </TooltipProvider>
  );
}
