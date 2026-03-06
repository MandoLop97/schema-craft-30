import { useMemo } from 'react';
import { Schema, PageDefinition } from '@/types/schema';
import { createDefaultHomeSchema } from '@/lib/default-schema';
import { validateSchema } from '@/lib/schema-validator';
import { BuilderEditorShell } from '@/components/builder/BuilderEditorShell';
import { PageManager } from '@/components/builder/PageManager';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export interface NexoraBuilderAppProps {
  /** Initial schema to edit. If omitted, resolved from pages or default. */
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

  // ── Multi-page props ──
  /** List of pages available for editing. */
  pages?: PageDefinition[];
  /** Currently active page slug. */
  activePage?: string;
  /** Called when the user navigates to a different page. */
  onPageChange?: (slug: string) => void;
  /** Called on save with slug context. */
  onSaveWithSlug?: (slug: string, schema: Schema) => void;
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
  pages,
  activePage,
  onPageChange,
  onSaveWithSlug,
}: NexoraBuilderAppProps) {
  // When pages are provided but no activePage, show PageManager
  const showPageManager = pages && pages.length > 0 && !activePage;

  // Resolve schema: initialSchema > active page schema > default
  const { resolvedSchema, validationErrors } = useMemo(() => {
    let raw: Schema;
    if (initialSchema) {
      raw = initialSchema;
    } else if (pages && activePage) {
      const pageDef = pages.find((p) => p.slug === activePage);
      raw = pageDef?.schema ?? createDefaultHomeSchema().schema;
    } else {
      raw = createDefaultHomeSchema().schema;
    }

    const result = validateSchema(raw);
    if (result.errors.length > 0) {
      console.warn('[NexoraBuilder] Schema validation warnings:', result.errors);
    }

    return {
      resolvedSchema: result.schema ?? createDefaultHomeSchema().schema,
      validationErrors: result.schema ? [] : result.errors,
    };
  }, [initialSchema, pages, activePage]);

  // Active page title for TopBar
  const activePageTitle = pages?.find((p) => p.slug === activePage)?.title;

  // Wrap onSave to also call onSaveWithSlug
  const handleSave = useMemo(() => {
    return (schema: Schema) => {
      onSave?.(schema);
      if (activePage && onSaveWithSlug) {
        onSaveWithSlug(activePage, schema);
      }
    };
  }, [onSave, activePage, onSaveWithSlug]);

  // Fatal validation error
  if (!showPageManager && validationErrors.length > 0) {
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

  // Page selection screen
  if (showPageManager) {
    return (
      <TooltipProvider>
        <Toaster />
        <div className={`min-h-screen flex items-center justify-center bg-background ${className || ''}`}>
          <PageManager
            pages={pages!}
            activePage={activePage}
            onSelectPage={(slug) => onPageChange?.(slug)}
          />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <div className="fixed bottom-2 left-2 z-[9999] px-2 py-1 rounded bg-foreground/80 text-background text-[10px] font-mono pointer-events-none select-none opacity-70">
        schema-craft runtime: 1.2.0
      </div>
      <BuilderEditorShell
        key={resolvedSchema.id}
        initialSchema={resolvedSchema}
        onSave={handleSave}
        onPublish={onPublish}
        onPreview={onPreview}
        onExport={onExport}
        className={className}
        pages={pages}
        activePage={activePage}
        onPageChange={onPageChange}
        pageTitle={activePageTitle}
      />
    </TooltipProvider>
  );
}
