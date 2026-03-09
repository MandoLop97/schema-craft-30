/**
 * ════════════════════════════════════════════════════════════════════════════
 * RENDER CONTEXT UTILITIES
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Helper functions for building and validating RenderContext objects.
 * Used by both the builder and consumer templates.
 */

import { RenderContext, PageContext, RenderMode } from '@/types/contract';
import { ThemeTokens, SchemaNode } from '@/types/schema';
import { buildHostData, DEFAULT_SAMPLE_PRODUCTS, DEFAULT_SAMPLE_COLLECTIONS, DEFAULT_SAMPLE_SETTINGS } from '@/lib/host-data';
import { PageType } from '@/types/page-types';

export interface BuildRenderContextOptions {
  mode: RenderMode;
  page?: Partial<PageContext>;
  products?: any[];
  collections?: any[];
  pages?: any[];
  settings?: Record<string, any>;
  cardTemplate?: {
    nodes: Record<string, SchemaNode>;
    rootNodeId: string;
    themeTokens?: ThemeTokens;
  };
  custom?: Record<string, any>;
  theme?: ThemeTokens;
  resolveAssetUrl?: (path: string) => string;
  /** Use sample data when data is not provided */
  useSampleData?: boolean;
}

/**
 * Build a complete RenderContext from options.
 * 
 * This is the recommended way to create a RenderContext in both
 * builder (edit mode) and template (public/preview mode).
 */
export function buildRenderContext(options: BuildRenderContextOptions): RenderContext {
  const {
    mode,
    page,
    products,
    collections,
    pages,
    settings,
    cardTemplate,
    custom,
    theme,
    resolveAssetUrl,
    useSampleData = mode === 'edit',
  } = options;

  // Build page context with defaults
  const pageContext: PageContext = {
    pageType: page?.pageType ?? 'custom',
    slug: page?.slug ?? '/',
    mode,
    params: page?.params,
    query: page?.query,
    metadata: page?.metadata,
  };

  // Build data with optional sample fallbacks
  const data = {
    products: products ?? (useSampleData ? DEFAULT_SAMPLE_PRODUCTS : []),
    collections: collections ?? (useSampleData ? DEFAULT_SAMPLE_COLLECTIONS : []),
    pages: pages ?? [],
    settings: settings ?? (useSampleData ? DEFAULT_SAMPLE_SETTINGS : {}),
    cardTemplate,
    custom: custom ?? {},
  };

  return {
    mode,
    page: pageContext,
    data,
    theme,
    resolveAssetUrl,
  };
}

/**
 * Validate a RenderContext and return any issues.
 * Used for debugging and pre-render checks.
 */
export function validateRenderContext(ctx: RenderContext | undefined): string[] {
  const issues: string[] = [];

  if (!ctx) {
    issues.push('RenderContext is undefined');
    return issues;
  }

  if (!ctx.mode) {
    issues.push('RenderContext.mode is required');
  }

  // In public mode, we expect full data
  if (ctx.mode === 'public') {
    if (!ctx.page) {
      issues.push('RenderContext.page should be provided in public mode');
    }
    if (!ctx.data) {
      issues.push('RenderContext.data should be provided in public mode');
    }
  }

  return issues;
}

/**
 * Check if RenderContext is "strict" (has all required fields for production).
 * V1.1 will make these fields required; this helper aids migration.
 */
export function isStrictRenderContext(ctx: RenderContext): boolean {
  return !!(ctx.page && ctx.data);
}

/**
 * Build RenderContext for edit mode using hostData.
 * This is the standard builder context builder.
 */
export function buildEditContext(
  hostData: Record<string, any> | undefined,
  theme?: ThemeTokens
): RenderContext {
  const data = buildHostData(hostData);
  return {
    mode: 'edit',
    data,
    theme,
  };
}

/**
 * Create an iteration context for collection rendering (e.g., ProductGrid).
 * Clones the parent context and adds currentItem/currentIndex.
 */
export function createIterationContext(
  parentContext: RenderContext,
  item: any,
  index: number
): RenderContext {
  return {
    ...parentContext,
    currentItem: item,
    currentIndex: index,
  };
}
