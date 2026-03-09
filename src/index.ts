import './index.css';

// Runtime version
export { EDITOR_VERSION } from './lib/version';

// i18n — locale system
export { setLocale, setLocaleByCode, t, es, en, translateCategory } from './lib/i18n';
export type { BuilderLocale } from './lib/i18n';

// Main editor component
export { NexoraBuilderApp } from './NexoraBuilderApp';
export type { NexoraBuilderAppProps } from './NexoraBuilderApp';
export type { PublishPayload } from './components/builder/PublishDialog';

// Schema types
export type { Schema, SchemaNode, NodeType, BuiltInNodeType, NodeProps, NodeStyle, ThemeTokens, Page, PageDefinition, RenderMode, TemplateType, AnimationPreset } from './types/schema';
export { ANIMATION_PRESETS } from './types/schema';

// Contract types — shared between constructor and template
export type {
  DataBinding, NodeDataSource, NodeBindings, DataSourceType,
  BoundSchemaNode, RenderContext,
  // Per-node prop types
  TextNodeProps, ImageNodeProps, ButtonNodeProps,
  ProductCardNodeProps, ProductGridNodeProps, CollectionGridNodeProps,
  HeroSectionNodeProps, ImageBannerNodeProps, RichTextSectionNodeProps,
  CTASectionNodeProps, TestimonialSectionNodeProps, FAQSectionNodeProps,
  NavbarNodeProps, FooterNodeProps, BaseNodeProps, AllNodeProps,
  // Block definition types (re-exported from contract)
  NexoraExports,
} from './types/contract';
export { supportsDataBinding, isCommerceBlock, isTemplateBlock } from './types/contract';

// Data binding utilities
export {
  resolveBindings, hydrateTemplate, hydrateNodeForItem,
  resolveFieldPath, setFieldPath,
  createDefaultBindings, hasActiveBindings, getBoundProps,
  registerTransform, getAvailableTransforms,
} from './lib/binding-utils';

// Mock data for edit/preview mode
export { DEFAULT_MOCK_PRODUCTS, DEFAULT_MOCK_COLLECTIONS, DEFAULT_MOCK_SETTINGS, buildMockRenderData } from './lib/mock-data';

// Renderer — for hosts that want to render schemas outside the builder
export { PageRenderer } from './components/schema/PageRenderer';
export { CustomStylesInjector } from './components/builder/CustomStylesInjector';
export { MediaGallery } from './components/builder/MediaGallery';
export { ProductPicker } from './components/builder/ProductPicker';

// Node registry types — for hosts that want to provide custom components
export type { NodeComponentProps, NodeComponent, CustomComponentMap } from './components/schema/NodeRegistry';

// Page Manager — for hosts that want to use the page list independently
export { PageManager } from './components/builder/PageManager';
export type { PageManagerProps } from './components/builder/PageManager';

// Block registry — for hosts that want to inspect or extend available blocks
export { blockRegistry, getBlockDef, getCategories, getBlocksByCategory, getCategoriesForTemplate, registerBlock, registerBlocks } from './lib/block-registry';
export type { BlockDefinition, InspectorFieldDef, CompositeNodeTree } from './lib/block-registry';

// Node utilities — for hosts that want to create or inspect nodes programmatically
export { createNode, createNodeTree, isContainerType, duplicateNodeTree } from './lib/node-factory';

// Schema utilities — for hosts that want to scaffold or validate schemas
export { createDefaultHomeSchema } from './lib/default-schema';
export { nodeStyleToCSS, generatePseudoStateCSS, generateResponsiveCSS, themeTokensToCSS } from './lib/style-utils';
export { validateSchema } from './lib/schema-validator';
export type { SchemaValidationResult } from './lib/schema-validator';

// Publish validation — pre-publish checks
export { validateForPublish } from './lib/publish-validator';
export type { PublishValidationResult, ValidationIssue, ValidationSeverity } from './lib/publish-validator';

// Page types, metadata, visibility
export type { PageType, PageMetadata, PageContext, VisibilityRule, DeviceVisibility, LockedPropsConfig } from './types/page-types';
export { PAGE_TYPE_LABELS, BLOCK_PAGE_TYPE_DEFAULTS, isBlockCompatibleWithPage } from './types/page-types';

// Default schemas — all 8 page schema factories + definitions
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
