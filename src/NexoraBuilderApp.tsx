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
  /**
   * Initial schema to load in the editor.
   * Takes priority over any schema resolved from `pages`.
   * If omitted, the editor falls back to the active page's schema or a built-in default.
   */
  initialSchema?: Schema;

  /**
   * Optional domain context string passed through to callbacks.
   * Useful for multi-tenant hosts that manage schemas per domain.
   */
  domain?: string;

  /**
   * Optional page slug context. Informational — does not affect editor behavior directly.
   */
  pageSlug?: string;

  /**
   * Called when the user clicks **Save**. Receives the current schema.
   */
  onSave?: (schema: Schema) => void;

  /**
   * Called when the user clicks **Publish**. Receives the current schema.
   * If omitted, the built-in publish dialog is shown instead.
   */
  onPublish?: (schema: Schema) => void;

  /**
   * Called when the user clicks **Preview**. Receives the current schema.
   */
  onPreview?: (schema: Schema) => void;

  /**
   * Called when the user clicks **Export**. Receives the current schema.
   */
  onExport?: (schema: Schema) => void;

  /** CSS class name applied to the root container. */
  className?: string;

  // ── Multi-page props ──

  /**
   * List of pages available for editing.
   * When provided, a **Pages** tab appears in the left sidebar.
   * If `activePage` is not set, the editor shows the PageManager as a full-screen page selector.
   */
  pages?: PageDefinition[];

  /**
   * Slug of the currently active page (must match a slug in `pages[]`).
   * When set together with `pages`, the editor loads that page's schema.
   */
  activePage?: string;

  /**
   * Called when the user selects a different page from the Pages tab or clicks the back button.
   * The host is responsible for updating `activePage` accordingly.
   */
  onPageChange?: (slug: string) => void;

  /**
   * Called on save alongside `onSave`, providing the active page slug for routing-aware persistence.
   */
  onSaveWithSlug?: (slug: string, schema: Schema) => void;

  /**
   * Handler for the built-in publish dialog. Receives domain, schema and mode.
   * Required if `onPublish` is not provided and the internal dialog is used.
   */
  onPublishSubmit?: (payload: PublishPayload) => Promise<void>;

  /**
   * Locale code ('es' | 'en') or a full BuilderLocale object for custom translations.
   * Defaults to 'es' (Spanish).
   */
  locale?: 'es' | 'en' | BuilderLocale;

  /**
   * Map of custom React components that override built-in node renderers.
   * Keys are NodeType strings (e.g. 'HeroSection', 'Footer').
   * Components receive { node, mode, renderChildren } props.
   */
  customComponents?: CustomComponentMap;

  /**
   * Additional block definitions to register in the palette.
   * Each entry makes a new block type available for drag-and-drop.
   * Pair with `customComponents` to provide the React renderer.
   */
  extraBlocks?: BlockDefinition[];
}
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
}: NexoraBuilderAppProps) {
  // Apply locale
  useEffect(() => {
    if (!localeProp) return;
    if (typeof localeProp === 'string') {
      setLocaleByCode(localeProp);
    } else {
      setLocale(localeProp);
    }
  }, [localeProp]);
  // When pages are provided but no activePage, auto-select the first page
  useEffect(() => {
    if (pages && pages.length > 0 && !activePage && onPageChange) {
      onPageChange(pages[0].slug);
    }
  }, [pages, activePage, onPageChange]);

  const showPageManager = false;

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
        <div className={`nxr-editor min-h-screen flex items-center justify-center bg-background ${className || ''}`}>
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
      <BuilderEditorShell
        key={resolvedSchema.id}
        initialSchema={resolvedSchema}
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
      />
    </TooltipProvider>
  );
}
