/**
 * ════════════════════════════════════════════════════════════════════════════
 * @mandolop97/constructor-nexora
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Nexora Visual Builder — A schema-first visual page builder for React.
 *
 * Full documentation: see NEXORA.md in the package root
 * (node_modules/@mandolop97/constructor-nexora/NEXORA.md)
 *
 * @packageDocumentation
 */

import './index.css';

// ── Runtime version ──────────────────────────────────────────────────────
/** Current editor version, injected at build time via Vite `define`. */
export { EDITOR_VERSION } from './lib/version';

// ── i18n — Locale system ─────────────────────────────────────────────────
/** Functions and types for internationalization. Supports 'es' and 'en' built-in, plus custom locale objects. */
export { setLocale, setLocaleByCode, t, es, en, translateCategory } from './lib/i18n';
export type { BuilderLocale } from './lib/i18n';

// ── Main editor component ────────────────────────────────────────────────
/** The main visual editor. Accepts schema, callbacks, locale, and extensibility props. See NEXORA.md §3. */
export { NexoraBuilderApp } from './NexoraBuilderApp';
export type { NexoraBuilderAppProps } from './NexoraBuilderApp';
export type { PublishPayload } from './components/builder/PublishDialog';

// ── Schema types ─────────────────────────────────────────────────────────
/** Core data model types. Schema is a flat node map with ThemeTokens. See NEXORA.md §2. */
export type { Schema, SchemaNode, NodeType, BuiltInNodeType, NodeProps, NodeStyle, ThemeTokens, Page, PageDefinition, RenderMode, TemplateType, AnimationPreset } from './types/schema';
export { ANIMATION_PRESETS } from './types/schema';

// ── Contract types — Shared between builder and host template ────────────
/** Official v1.7.0 contract. Defines RenderContext, data bindings, slots, publish pipeline. See NEXORA.md §9-12. */
export type {
  DataBinding, NodeDataSource, NodeBindings, DataSourceType,
  BoundSchemaNode, RenderContext, PageContext,
  SlotBehavior, SlotAssignment,
  PublishStage, ValidatorOptions, PublishPipeline,
  TextNodeProps, ImageNodeProps, ButtonNodeProps,
  ProductCardNodeProps, ProductGridNodeProps, CollectionGridNodeProps,
  HeroSectionNodeProps, ImageBannerNodeProps, RichTextSectionNodeProps,
  CTASectionNodeProps, TestimonialSectionNodeProps, FAQSectionNodeProps,
  NavbarNodeProps, FooterNodeProps, BaseNodeProps, AllNodeProps,
  NexoraExports,
} from './types/contract';
export { supportsDataBinding, isCommerceBlock, isTemplateBlock } from './types/contract';

// ── Data binding utilities ───────────────────────────────────────────────
/** Resolve bindings, hydrate templates, register transforms. See NEXORA.md §9. */
export {
  resolveBindings, hydrateTemplate, hydrateNodeForItem,
  resolveFieldPath, setFieldPath,
  createDefaultBindings, hasActiveBindings, getBoundProps,
  registerTransform, getAvailableTransforms,
} from './lib/binding-utils';

// ── Host data for edit/preview mode ──────────────────────────────────────
/** Sample data and builder for hostData. Used to populate the editor with preview data. */
export { DEFAULT_SAMPLE_PRODUCTS, DEFAULT_SAMPLE_COLLECTIONS, DEFAULT_SAMPLE_SETTINGS, buildHostData } from './lib/host-data';
/** @deprecated Use the host-data exports above. Kept for backward compatibility. */
export { DEFAULT_MOCK_PRODUCTS, DEFAULT_MOCK_COLLECTIONS, DEFAULT_MOCK_SETTINGS, buildMockRenderData } from './lib/mock-data';

// ── RenderContext utilities ──────────────────────────────────────────────
/** Build, validate, and iterate RenderContext objects. See NEXORA.md §9. */
export { buildRenderContext, buildEditContext, createIterationContext, validateRenderContext, isStrictRenderContext } from './lib/render-context-utils';
export type { BuildRenderContextOptions } from './lib/render-context-utils';

// ── Slot utilities ───────────────────────────────────────────────────────
/** Query and validate slot assignments on schema nodes. See NEXORA.md §10. */
export { getSlotAssignment, isInSlot, getSlotBehavior, isSlotLocked, isSlotEditable, isSlotDynamic, getNodesInSlot, getSlotFallback, getSlotConstraints, validateSlots } from './lib/slot-utils';
export type { SlotConstraints } from './lib/slot-utils';

// ── Renderer — For rendering schemas outside the builder ─────────────────
/** Use PageRenderer to render a schema in 'public' or 'preview' mode. See NEXORA.md §4. */
export { PageRenderer } from './components/schema/PageRenderer';
/** Inject custom CSS into a rendered page. */
export { CustomStylesInjector } from './components/builder/CustomStylesInjector';
/** Media gallery component for browsing uploaded assets. */
export { MediaGallery } from './components/builder/MediaGallery';
/** Product picker component for selecting products from hostData. */
export { ProductPicker } from './components/builder/ProductPicker';

// ── Node registry types ──────────────────────────────────────────────────
/** Types for custom node components. Implement NodeComponent to create custom blocks. See NEXORA.md §14. */
export type { NodeComponentProps, NodeComponent, CustomComponentMap } from './components/schema/NodeRegistry';

// ── Page Manager ─────────────────────────────────────────────────────────
/** Standalone page list/selector for multi-page setups. See NEXORA.md §11. */
export { PageManager } from './components/builder/PageManager';
export type { PageManagerProps } from './components/builder/PageManager';

// ── Block registry ───────────────────────────────────────────────────────
/** Inspect, extend, and query the available block types. See NEXORA.md §5. */
export { blockRegistry, getBlockDef, getCategories, getBlocksByCategory, getCategoriesForTemplate, registerBlock, registerBlocks } from './lib/block-registry';
export type { BlockDefinition, InspectorFieldDef, CompositeNodeTree } from './lib/block-registry';

// ── Node utilities ───────────────────────────────────────────────────────
/** Create, clone, and inspect nodes programmatically. See NEXORA.md §6. */
export { createNode, createNodeTree, isContainerType, duplicateNodeTree } from './lib/node-factory';

// ── Schema utilities ─────────────────────────────────────────────────────
/** Scaffold and validate schemas. See NEXORA.md §12. */
export { createDefaultHomeSchema } from './lib/default-schema';
export { nodeStyleToCSS, generatePseudoStateCSS, generateResponsiveCSS, themeTokensToCSS } from './lib/style-utils';
export { validateSchema } from './lib/schema-validator';
export type { SchemaValidationResult } from './lib/schema-validator';

// ── Publish validation ───────────────────────────────────────────────────
/** Pre-publish checks. Run before allowing schema publication. See NEXORA.md §12. */
export { validateForPublish } from './lib/publish-validator';
export type { PublishValidationResult, ValidationIssue, ValidationSeverity } from './lib/publish-validator';

// ── Page types, metadata, visibility ─────────────────────────────────────
/** Page type system with visibility rules and compatibility checks. */
export type { PageType, PageMetadata, VisibilityRule, DeviceVisibility, LockedPropsConfig } from './types/page-types';
export { PAGE_TYPE_LABELS, BLOCK_PAGE_TYPE_DEFAULTS, isBlockCompatibleWithPage } from './types/page-types';

// ── Default schemas — All page schema factories + definitions ────────────
/** Pre-built schema factories for common page types (home, products, FAQ, etc.). See NEXORA.md §11. */
export {
  createHomeSchema,
  createProductsSchema,
  createFAQSchema,
  createContactSchema,
  createHelpSchema,
  createPrivacySchema,
  createTermsSchema,
  createWishlistSchema,
  PAGE_DEFINITIONS,
  getDefaultSchemaForSlug,
} from './lib/default-schemas';
export type { PageSchemaDefinition } from './lib/default-schemas';
