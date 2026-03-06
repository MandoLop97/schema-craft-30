import './index.css';

// Main editor component
export { NexoraBuilderApp } from './NexoraBuilderApp';
export type { NexoraBuilderAppProps } from './NexoraBuilderApp';

// Schema types
export type { Schema, SchemaNode, NodeType, NodeProps, NodeStyle, ThemeTokens, Page, RenderMode } from './types/schema';

// Renderer — for hosts that want to render schemas outside the builder
export { PageRenderer } from './components/schema/PageRenderer';

// Block registry — for hosts that want to inspect or extend available blocks
export { blockRegistry, getBlockDef, getCategories, getBlocksByCategory } from './lib/block-registry';
export type { BlockDefinition } from './lib/block-registry';

// Node utilities — for hosts that want to create or inspect nodes programmatically
export { createNode, isContainerType } from './lib/node-factory';

// Schema utilities — for hosts that want to scaffold or validate schemas
export { createDefaultHomeSchema } from './lib/default-schema';
export { validateSchema } from './lib/schema-validator';
export type { SchemaValidationResult } from './lib/schema-validator';
