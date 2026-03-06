import './index.css';

// Runtime version
export { EDITOR_VERSION } from './lib/version';

// Main editor component
export { NexoraBuilderApp } from './NexoraBuilderApp';
export type { NexoraBuilderAppProps } from './NexoraBuilderApp';
export type { PublishPayload } from './components/builder/PublishDialog';

// Schema types
export type { Schema, SchemaNode, NodeType, NodeProps, NodeStyle, ThemeTokens, Page, PageDefinition, RenderMode } from './types/schema';

// Renderer — for hosts that want to render schemas outside the builder
export { PageRenderer } from './components/schema/PageRenderer';

// Page Manager — for hosts that want to use the page list independently
export { PageManager } from './components/builder/PageManager';
export type { PageManagerProps } from './components/builder/PageManager';

// Block registry — for hosts that want to inspect or extend available blocks
export { blockRegistry, getBlockDef, getCategories, getBlocksByCategory } from './lib/block-registry';
export type { BlockDefinition } from './lib/block-registry';

// Node utilities — for hosts that want to create or inspect nodes programmatically
export { createNode, isContainerType } from './lib/node-factory';

// Schema utilities — for hosts that want to scaffold or validate schemas
export { createDefaultHomeSchema } from './lib/default-schema';
export { validateSchema } from './lib/schema-validator';
export type { SchemaValidationResult } from './lib/schema-validator';

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
