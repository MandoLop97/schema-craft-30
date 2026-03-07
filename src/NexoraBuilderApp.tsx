import { useMemo, useEffect } from 'react';
import { Schema, PageDefinition } from '@/types/schema';
import { createDefaultHomeSchema } from '@/lib/default-schema';
import { validateSchema } from '@/lib/schema-validator';
import { BuilderEditorShell } from '@/components/builder/BuilderEditorShell';
import { PublishPayload } from '@/components/builder/PublishDialog';
import { BlockDefinition, registerBlocks } from '@/lib/block-registry';
import { PageManager } from '@/components/builder/PageManager';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { EDITOR_VERSION } from '@/lib/version';
import { setLocaleByCode, BuilderLocale, setLocale } from '@/lib/i18n';
import { CustomComponentMap } from '@/components/schema/NodeRegistry';

export interface NexoraBuilderAppProps {
  initialSchema?: Schema;
  domain?: string;
  pageSlug?: string;
  onSave?: (schema: Schema) => void;
  onPublish?: (schema: Schema) => void;
  onPreview?: (schema: Schema) => void;
  onExport?: (schema: Schema) => void;
  className?: string;
  pages?: PageDefinition[];
  activePage?: string;
  onPageChange?: (slug: string) => void;
  onSaveWithSlug?: (slug: string, schema: Schema) => void;
  onPublishSubmit?: (payload: PublishPayload) => Promise<void>;
  locale?: 'es' | 'en' | BuilderLocale;
  customComponents?: CustomComponentMap;
  extraBlocks?: BlockDefinition[];
  /** URLs of external CSS stylesheets to inject into the canvas */
  customStylesheets?: string[];
  /** Raw CSS string to inject into the canvas */
  customCSS?: string;
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
  onPublishSubmit,
  locale: localeProp,
  customComponents,
  extraBlocks,
  customStylesheets,
  customCSS,
}: NexoraBuilderAppProps) {
  // Register extra blocks
  useEffect(() => {
    if (extraBlocks && extraBlocks.length > 0) {
      registerBlocks(extraBlocks);
    }
  }, [extraBlocks]);

  // Apply locale
  useEffect(() => {
    if (!localeProp) return;
    if (typeof localeProp === 'string') {
      setLocaleByCode(localeProp);
    } else {
      setLocale(localeProp);
    }
  }, [localeProp]);

  const hasPages = pages && pages.length > 0;
  // Show selector when pages exist but no page is selected yet
  const showPageManager = hasPages && !activePage;

  // Resolve schema: initialSchema > active page schema > default
  const { resolvedSchema, validationErrors } = useMemo(() => {
    if (showPageManager) {
      return { resolvedSchema: null, validationErrors: [] };
    }

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
  }, [initialSchema, pages, activePage, showPageManager]);

  const activePageTitle = pages?.find((p) => p.slug === activePage)?.title;

  const handleSave = useMemo(() => {
    return (schema: Schema) => {
      onSave?.(schema);
      if (activePage && onSaveWithSlug) {
        onSaveWithSlug(activePage, schema);
      }
    };
  }, [onSave, activePage, onSaveWithSlug]);

  // Page selection screen (full-screen)
  if (showPageManager) {
    return (
      <TooltipProvider>
        <Toaster />
        <div className={`nxr-editor min-h-screen bg-background ${className || ''}`}>
          <PageManager
            pages={pages!}
            activePage={activePage}
            onSelectPage={(slug) => onPageChange?.(slug)}
          />
        </div>
      </TooltipProvider>
    );
  }

  // Fatal validation error
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
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <BuilderEditorShell
        key={resolvedSchema!.id}
        initialSchema={resolvedSchema!}
        onSave={handleSave}
        onPublish={onPublish}
        onPreview={onPreview}
        onExport={onExport}
        className={`nxr-editor ${className || ''}`}
        pages={pages}
        activePage={activePage}
        onPageChange={onPageChange}
        pageTitle={activePageTitle}
        onPublishSubmit={onPublishSubmit}
        customComponents={customComponents}
        onBack={hasPages ? () => onPageChange?.('') : undefined}
      />
    </TooltipProvider>
  );
}
