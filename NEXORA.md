# Nexora Visual Builder — Full Technical Documentation

> **Package:** `@mandolop97/constructor-nexora`
> **Contract Version:** 1.7.0
> **This file ships with the NPM package.** Any developer or AI assistant working in a project where this package is installed can read this documentation from `node_modules/@mandolop97/constructor-nexora/NEXORA.md`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Types](#2-core-types)
3. [NexoraBuilderApp — Main Component API](#3-nexorabuilderapp--main-component-api)
4. [PageRenderer — Schema Rendering](#4-pagerenderer--schema-rendering)
5. [Block System & Registry](#5-block-system--registry)
6. [Node Factory](#6-node-factory)
7. [Style System](#7-style-system)
8. [Theme Tokens](#8-theme-tokens)
9. [Data Binding & RenderContext](#9-data-binding--rendercontext)
10. [Slot System](#10-slot-system)
11. [Multi-Page System](#11-multi-page-system)
12. [Publish Pipeline](#12-publish-pipeline)
13. [Internationalization (i18n)](#13-internationalization-i18n)
14. [Extensibility](#14-extensibility)
15. [All Package Exports](#15-all-package-exports)
16. [Integration Examples](#16-integration-examples)

---

## 1. Architecture Overview

The builder follows a **schema-first** model: the entire UI is described as a flat JSON tree (`Schema`) that is rendered recursively by `PageRenderer`.

### Render Modes (`RenderMode`)

| Mode      | Use Case             | Characteristics                                  |
|-----------|----------------------|--------------------------------------------------|
| `edit`    | Visual builder       | Selection outlines, drop zones, drag & drop      |
| `preview` | Clean preview        | No editing controls                              |
| `public`  | Published site       | Production mode, no builder dependencies         |

### Data Flow

```
Host App
  └─ <NexoraBuilderApp initialSchema={...} onSave={...} />
       └─ BuilderEditorShell (internal schema state + undo/redo)
            ├─ TopBar (actions: save, publish, preview, export)
            ├─ BlocksPalette (left sidebar: draggable blocks)
            ├─ BuilderCanvas (central canvas with PageRenderer in edit mode)
            └─ Inspector (right sidebar: props, styles, theme)
```

### Data Ownership Policy

| Layer            | Responsibility                | Prohibitions                        |
|------------------|-------------------------------|-------------------------------------|
| Host/Template    | Fetch + adapt data. Build RenderContext. Provide hostData. | Cannot modify schema nodes directly |
| Builder (editor) | Schema CRUD. Adapt hostData for preview. Validate before publish. | NO fetch to external APIs. NO direct DB calls for business data. |
| Renderer         | Render nodes from schema + resolved context. Pure. | NO fetch. NO state mutation. Read-only. |

---

## 2. Core Types

### `Schema`

```typescript
interface Schema {
  id: string;
  version: number;
  updatedAt: string;
  themeTokens: ThemeTokens;
  rootNodeId: string;
  nodes: Record<string, SchemaNode>;
  globalStyles?: Record<string, GlobalStyleDef>;
}
```

Flat map of nodes. `rootNodeId` points to the root node. Children are referenced by ID in `children: string[]`.

### `SchemaNode`

```typescript
interface SchemaNode {
  id: string;
  type: NodeType;
  props: NodeProps;
  style: NodeStyle;
  children: string[];
  locked?: boolean;
  hidden?: boolean;
  customName?: string;
  customCSS?: string;
  appliedGlobalStyles?: string[];
  slot?: SlotAssignment;
}
```

### `NodeType`

Built-in types:

- **Layout:** `Section`, `Container`, `Grid`, `Stack`
- **Content:** `Text`, `Image`, `Divider`, `Badge`, `Spacer`, `Icon`, `SocialIcons`
- **UI:** `Button`, `Card`, `Input`
- **Interactive:** `Accordion`, `TabsBlock`, `VideoEmbed`, `FormBlock`
- **Commerce:** `ProductCard`, `ProductGrid`, `CollectionGrid`
- **Site (global):** `Navbar`, `Footer`, `AnnouncementBar`
- **Template blocks:** `HeroSection`, `FeatureBar`, `TestimonialCard`, `NewsletterSection`, `ImageBanner`, `RichTextSection`, `CTASection`, `TestimonialSection`, `FAQSection`

Extensible with `string & {}` for custom host types.

### `NodeStyle`

Object with ~80+ CSS properties organized in categories:

- **Layout & Box Model:** `padding`, `margin`, `gap`, `width`, `height`, `minHeight`, `maxWidth`, `display`, `flexDirection`, `alignItems`, `justifyContent`, `gridTemplateColumns`, `position`, `zIndex`, etc.
- **Typography:** `color`, `fontSize`, `fontWeight`, `fontFamily`, `lineHeight`, `letterSpacing`, `textAlign`, `textTransform`, `textDecoration`, etc.
- **Background:** `backgroundColor`, `backgroundImage`, `backgroundSize`, `backgroundPosition`, `backgroundGradient`, etc.
- **Border:** `borderColor`, `borderWidth`, `borderRadius`, `borderStyle`, etc.
- **Shadow & Effects:** `boxShadow`, `opacity`, `filter`, `backdropFilter`, `clipPath`, etc.
- **Transforms:** `transform`, `transformOrigin`, `perspective`
- **Transitions:** `transition`, `transitionProperty`, `transitionDuration`, etc.
- **Animations:** `animation`, `animationName`, `animationDuration`, etc.
- **Pseudo-state overrides:** `hover`, `focus`, `active` — partial style overrides per pseudo-state
- **Responsive overrides:** `responsive.{sm|md|lg|xl}` — partial style overrides per breakpoint (generates `@container` queries)

### `NodeProps`

Semantic properties for each node type: `text`, `href`, `src`, `alt`, `label`, `price`, `links[]`, `items[]`, `panels[]`, `videoUrl`, `heading`, `subtitle`, `ctaText`, `ctaHref`, `scrollAnimation`, etc. Accepts `[key: string]: any` for custom props.

### `ThemeTokens`

```typescript
interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    muted: string;
    border: string;
    accent?: string;
  };
  typography: {
    fontFamily: string;
    baseSize: string;
    headingScale: number;
  };
  radius: { sm: string; md: string; lg: string };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string };
  gradient?: string;
  defaultCardLayout?: 'vertical' | 'horizontal' | 'minimal' | 'overlay';
}
```

### `AnimationPreset`

Available presets: `fadeIn`, `fadeOut`, `slideUp`, `slideDown`, `slideLeft`, `slideRight`, `scaleIn`, `scaleOut`, `bounceIn`, `pulse`, `shake`, `none`.

---

## 3. NexoraBuilderApp — Main Component API

The main entry point for the visual editor.

```typescript
interface NexoraBuilderAppProps {
  /** Initial schema to load in the editor */
  initialSchema?: Schema;
  /** Domain for publishing */
  domain?: string;
  /** Current page slug */
  pageSlug?: string;

  // ── Callbacks ──
  onSave?: (schema: Schema) => void;
  onPublish?: (schema: Schema) => void;
  onPreview?: (schema: Schema) => void;
  onExport?: (schema: Schema) => void;
  onSaveWithSlug?: (slug: string, schema: Schema) => void;
  onPublishSubmit?: (payload: PublishPayload) => Promise<void>;

  // ── Multi-page ──
  pages?: PageDefinition[];
  activePage?: string;
  onPageChange?: (slug: string) => void;

  // ── Localization ──
  locale?: 'es' | 'en' | BuilderLocale;

  // ── Extensibility ──
  customComponents?: CustomComponentMap;
  extraBlocks?: BlockDefinition[];

  // ── Custom injection ──
  customStylesheets?: string[];   // External CSS URLs
  customCSS?: string;             // Raw CSS string
  customScripts?: string[];       // External script URLs

  // ── Asset handling ──
  onImageUpload?: (file: File) => Promise<string>;
  resolveAssetUrl?: (path: string) => string;

  // ── Data ──
  hostData?: Record<string, any>;
  renderContext?: RenderContext;

  className?: string;
}
```

### Usage

```tsx
import { NexoraBuilderApp } from '@mandolop97/constructor-nexora';
import '@mandolop97/constructor-nexora/styles.css';

function App() {
  return (
    <NexoraBuilderApp
      initialSchema={mySchema}
      onSave={(schema) => saveToDatabase(schema)}
      onPublish={(schema) => publishSite(schema)}
      locale="en"
    />
  );
}
```

---

## 4. PageRenderer — Schema Rendering

Recursive renderer that traverses the node tree from `rootNodeId`. Used both inside the builder and for standalone rendering (e.g., published sites).

```tsx
import { PageRenderer } from '@mandolop97/constructor-nexora';

// Render a schema outside the builder
<PageRenderer
  schema={mySchema}
  mode="public"
  renderContext={myRenderContext}
/>
```

### NodeComponentProps

Every node component receives:

```typescript
interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
  mockData?: Record<string, any>;
}
```

---

## 5. Block System & Registry

### `BlockDefinition`

```typescript
interface BlockDefinition {
  type: NodeType;
  label: string;
  icon?: React.ComponentType;
  category: string;
  canHaveChildren: boolean;
  defaultProps?: Partial<NodeProps>;
  defaultStyle?: Partial<NodeStyle>;
  inspectorFields: InspectorFieldDef[];
  compositeFactory?: () => CompositeNodeTree;
  templateType?: TemplateType;
}
```

### `InspectorFieldDef`

```typescript
interface InspectorFieldDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'color' | 'number' | 'image' | 'toggle'
      | 'slider' | 'textarea' | 'link' | 'icon' | 'spacing'
      | 'group' | 'binding' | 'array';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  rows?: number;
  children?: InspectorFieldDef[];       // For 'group' type
  arrayFields?: ArrayFieldDef[];        // For 'array' type
  newItemDefaults?: Record<string, any>;
  addLabel?: string;
  maxItems?: number;
  allowedDataSources?: string[];        // For 'binding' type
  bindableFields?: string[];
}
```

### Composite Blocks

`compositeFactory` returns `{ rootId, nodes }` — a pre-built mini node tree (e.g., HeroSection with Container + Text + Button).

### Registry API

```typescript
import { blockRegistry, registerBlock, registerBlocks, getBlockDef,
         getCategories, getBlocksByCategory, getCategoriesForTemplate } from '@mandolop97/constructor-nexora';

// Register custom blocks
registerBlock(myBlockDef);
registerBlocks([block1, block2]);

// Query blocks
getBlockDef('Button');                    // → BlockDefinition | undefined
getCategories();                          // → string[]
getBlocksByCategory('Layout');            // → BlockDefinition[]
getCategoriesForTemplate('page');         // → string[]
```

---

## 6. Node Factory

```typescript
import { createNode, createNodeTree, isContainerType, duplicateNodeTree } from '@mandolop97/constructor-nexora';

createNode('Button');        // Single node with defaults from registry
createNodeTree('HeroSection'); // Full composite tree if compositeFactory exists
isContainerType('Section');  // true — can have children
duplicateNodeTree(nodeId, nodes); // Deep clone with new IDs
```

---

## 7. Style System

```typescript
import { nodeStyleToCSS, generatePseudoStateCSS, generateResponsiveCSS, themeTokensToCSS } from '@mandolop97/constructor-nexora';

// Convert NodeStyle to React.CSSProperties
const css = nodeStyleToCSS(node.style);

// Generate :hover/:focus/:active CSS rules
const pseudoCSS = generatePseudoStateCSS(node.id, node.style);

// Generate @container responsive queries
const responsiveCSS = generateResponsiveCSS(node.id, node.style);

// Convert ThemeTokens to CSS custom properties
const themeCSSVars = themeTokensToCSS(schema.themeTokens);
```

### CSS Scoping

The editor lives inside `.nxr-editor` which defines fallback CSS variables for Tailwind/Shadcn tokens, avoiding conflicts with the host application.

---

## 8. Theme Tokens

ThemeTokens are injected as CSS custom properties in the canvas:

```css
--primary: [value]
--secondary: [value]
--background: [value]
--foreground: [value]       /* = colors.text */
--muted: [value]
--border: [value]
--accent: [value]
--radius: [value]           /* = radius.md */
--font-family: [value]
--font-size-base: [value]
```

The `ThemeEditor` component updates these tokens in the schema, re-injected in real time.

---

## 9. Data Binding & RenderContext

### RenderContext v1.7.0

The single source of truth for all rendering data, built by the Host/Template layer:

```typescript
interface RenderContext {
  mode: RenderMode;
  page?: PageContext;
  data?: {
    products: any[];
    collections: any[];
    pages: any[];
    settings: Record<string, any>;
    cardTemplate?: {
      nodes: Record<string, SchemaNode>;
      rootNodeId: string;
      themeTokens?: ThemeTokens;
    };
    custom: Record<string, any>;
  };
  currentItem?: any;
  currentIndex?: number;
  theme?: ThemeTokens;
  resolveAssetUrl?: (path: string) => string;
}
```

### PageContext

```typescript
interface PageContext {
  pageType: PageType;
  slug: string;
  mode: RenderMode;
  params?: Record<string, string>;
  query?: Record<string, string>;
  metadata?: PageMetadata;
}
```

### Building RenderContext

```typescript
import { buildRenderContext, buildEditContext, createIterationContext,
         validateRenderContext, isStrictRenderContext } from '@mandolop97/constructor-nexora';

// For public/preview mode
const ctx = buildRenderContext({
  mode: 'public',
  page: { pageType: 'home', slug: '/' },
  products: myProducts,
  collections: myCollections,
  settings: mySettings,
});

// For edit mode (uses sample data automatically)
const editCtx = buildEditContext(hostData, themeTokens);

// For collection iteration (e.g., inside ProductGrid)
const itemCtx = createIterationContext(parentCtx, product, index);
```

### Data Binding Types

```typescript
interface DataBinding {
  propKey: string;    // Node prop (e.g., 'text', 'src', 'price')
  fieldPath: string;  // Data path (e.g., 'product.title')
  transform?: string; // Optional transform (e.g., 'formatPrice')
}

interface NodeBindings {
  dataSource?: NodeDataSource;
  bindings?: DataBinding[];
  fallbackProps?: Record<string, any>;
  mode: 'manual' | 'bound' | 'hybrid';
}
```

### Binding Utilities

```typescript
import { resolveBindings, hydrateTemplate, hydrateNodeForItem,
         resolveFieldPath, setFieldPath,
         createDefaultBindings, hasActiveBindings, getBoundProps,
         registerTransform, getAvailableTransforms } from '@mandolop97/constructor-nexora';
```

### Host Data / Sample Data

```typescript
import { DEFAULT_SAMPLE_PRODUCTS, DEFAULT_SAMPLE_COLLECTIONS,
         DEFAULT_SAMPLE_SETTINGS, buildHostData } from '@mandolop97/constructor-nexora';
```

---

## 10. Slot System

Slots enable template integration with controlled editability:

```typescript
type SlotBehavior = 'locked' | 'editable' | 'dynamic';

interface SlotAssignment {
  __slot: string;         // Slot ID (e.g., 'header', 'footer', 'main')
  behavior: SlotBehavior; // What can be done with the slot content
  fallbackNodeId?: string;
}
```

| Behavior   | Description                                                    |
|------------|----------------------------------------------------------------|
| `locked`   | Render as-is. Inspector disabled. Cannot delete/move.          |
| `editable` | Full inspector access. Can reorder children.                   |
| `dynamic`  | Data-driven. Bindings resolved at render. Children from data.  |

### Slot Utilities

```typescript
import { getSlotAssignment, isInSlot, getSlotBehavior, isSlotLocked,
         isSlotEditable, isSlotDynamic, getNodesInSlot, getSlotFallback,
         getSlotConstraints, validateSlots } from '@mandolop97/constructor-nexora';
```

---

## 11. Multi-Page System

```tsx
<NexoraBuilderApp
  pages={[
    { slug: 'home', title: 'Home', schema: homeSchema, templateType: 'page' },
    { slug: 'header', title: 'Header', schema: headerSchema,
      templateType: 'header', canvasSize: { width: 1200, height: 80 } },
  ]}
  activePage="home"
  onPageChange={(slug) => setActivePage(slug)}
  onSaveWithSlug={(slug, schema) => saveToDb(slug, schema)}
/>
```

### Template Types

| Type        | Description                    |
|-------------|--------------------------------|
| `page`      | Full page                      |
| `header`    | Site header fragment           |
| `footer`    | Site footer fragment           |
| `component` | Reusable component             |
| `single`    | Single piece (e.g., banner)    |

### Page Types

Available page types: `home`, `products`, `product-detail`, `collection`, `cart`, `checkout`, `faq`, `contact`, `help`, `privacy`, `terms`, `wishlist`, `custom`.

### Default Schemas

```typescript
import { PAGE_DEFINITIONS, getDefaultSchemaForSlug,
         createHomeSchema, createProductsSchema, createFAQSchema,
         createContactSchema, createHelpSchema, createPrivacySchema,
         createTermsSchema, createWishlistSchema } from '@mandolop97/constructor-nexora';
```

---

## 12. Publish Pipeline

```typescript
interface PublishPipeline {
  saveDraft: (schema: Schema) => Promise<void>;
  validate: (schema: Schema, opts?: ValidatorOptions) => { errors: string[]; warnings: string[] };
  preview?: (schema: Schema) => Promise<string>;
  publish: (payload: any) => Promise<void>;
}
```

Rules:
- `validate().errors.length > 0` **blocks** publish.
- Warnings are displayed but do NOT block.

### Pre-Publish Validation

```typescript
import { validateForPublish } from '@mandolop97/constructor-nexora';

const result = validateForPublish(schema);
// result: { valid: boolean; errors: ValidationIssue[]; warnings: ValidationIssue[] }
```

### Schema Validation

```typescript
import { validateSchema } from '@mandolop97/constructor-nexora';

const result = validateSchema(schema);
// result: { valid: boolean; errors: string[] }
```

---

## 13. Internationalization (i18n)

```tsx
// Use a predefined locale
<NexoraBuilderApp locale="es" />
<NexoraBuilderApp locale="en" />

// Use a custom locale object
<NexoraBuilderApp locale={{
  save: 'Guardar',
  publish: 'Publicar',
  // ... all keys
}} />
```

Programmatic API:

```typescript
import { setLocaleByCode, setLocale, t, es, en, translateCategory } from '@mandolop97/constructor-nexora';

setLocaleByCode('en');
setLocale(myCustomLocale);
t('save'); // → 'Save'
translateCategory('Layout'); // → translated category name
```

---

## 14. Extensibility

### Custom Components

```tsx
import { NexoraBuilderApp } from '@mandolop97/constructor-nexora';
import type { NodeComponent } from '@mandolop97/constructor-nexora';

const MyWidget: NodeComponent = ({ node, mode, renderChildren }) => (
  <div>{node.props.text}</div>
);

<NexoraBuilderApp
  customComponents={{ MyWidget }}
  extraBlocks={[{
    type: 'MyWidget',
    label: 'My Widget',
    category: 'Custom',
    canHaveChildren: false,
    defaultProps: { text: 'Hello' },
    inspectorFields: [{ key: 'text', label: 'Text', type: 'text' }],
  }]}
/>
```

### Custom Styles & Scripts

```tsx
<NexoraBuilderApp
  customStylesheets={['https://cdn.example.com/theme.css']}
  customCSS=".my-class { color: red; }"
  customScripts={['https://cdn.tailwindcss.com']}
/>
```

### Persistence

The builder is **stateless regarding storage**. The host controls persistence:

```tsx
<NexoraBuilderApp
  onSave={(schema) => saveToDatabase(schema)}
  onSaveWithSlug={(slug, schema) => savePageToDb(slug, schema)}
  onPublish={(schema) => publishSite(schema)}
  onPublishSubmit={async (payload) => {
    // payload: { domain, pages, status }
    await publishToProduction(payload);
  }}
/>
```

---

## 15. All Package Exports

### Components

| Export                  | Description                                      |
|-------------------------|--------------------------------------------------|
| `NexoraBuilderApp`      | Main visual editor component                     |
| `PageRenderer`          | Standalone schema renderer                        |
| `CustomStylesInjector`  | Inject custom CSS in public render                |
| `MediaGallery`          | Media gallery component                           |
| `ProductPicker`         | Product picker component                          |
| `PageManager`           | Page list/selector component                      |

### Block Registry

| Export                        | Description                            |
|-------------------------------|----------------------------------------|
| `blockRegistry`               | The block registry instance             |
| `registerBlock(def)`          | Register a single block                 |
| `registerBlocks(defs[])`      | Register multiple blocks                |
| `getBlockDef(type)`           | Get block definition by type            |
| `getCategories()`             | List all block categories               |
| `getBlocksByCategory(cat)`    | List blocks in a category               |
| `getCategoriesForTemplate(t)` | Filter categories by template type      |

### Node Utilities

| Export                    | Description                            |
|---------------------------|----------------------------------------|
| `createNode(type)`        | Create node with registry defaults      |
| `createNodeTree(type)`    | Create composite node tree              |
| `isContainerType(type)`   | Check if type accepts children          |
| `duplicateNodeTree(id,n)` | Deep clone with new IDs                 |

### Style Utilities

| Export                     | Description                           |
|----------------------------|---------------------------------------|
| `nodeStyleToCSS(style)`    | Convert NodeStyle to CSSProperties    |
| `generatePseudoStateCSS()` | Generate :hover/:focus/:active CSS   |
| `generateResponsiveCSS()`  | Generate @container queries          |
| `themeTokensToCSS(tokens)` | Convert ThemeTokens to CSS vars      |

### Schema & Validation

| Export                     | Description                           |
|----------------------------|---------------------------------------|
| `createDefaultHomeSchema()`| Default home page schema              |
| `validateSchema(schema)`   | Validate schema structure             |
| `validateForPublish(schema)`| Pre-publish validation               |

### Data Binding

| Export                     | Description                           |
|----------------------------|---------------------------------------|
| `resolveBindings()`        | Resolve data bindings on a node       |
| `hydrateTemplate()`        | Hydrate template with data            |
| `hydrateNodeForItem()`     | Hydrate node for a single data item   |
| `resolveFieldPath()`       | Resolve a dot-path on an object       |
| `setFieldPath()`           | Set a value at a dot-path             |
| `createDefaultBindings()`  | Create default bindings for a node    |
| `hasActiveBindings()`      | Check if a node has active bindings   |
| `getBoundProps()`          | Get resolved bound props              |
| `registerTransform()`      | Register a custom data transform      |
| `getAvailableTransforms()` | List available transforms             |

### RenderContext Utilities

| Export                      | Description                           |
|-----------------------------|---------------------------------------|
| `buildRenderContext(opts)`  | Build complete RenderContext           |
| `buildEditContext(data,t)`  | Build edit-mode context               |
| `createIterationContext()`  | Create iteration context for loops    |
| `validateRenderContext()`   | Validate a RenderContext              |
| `isStrictRenderContext()`   | Check if context is production-ready  |

### Slot Utilities

| Export                      | Description                           |
|-----------------------------|---------------------------------------|
| `getSlotAssignment(node)`   | Get slot assignment from a node       |
| `isInSlot(node)`            | Check if node is in a slot            |
| `getSlotBehavior(node)`     | Get slot behavior                     |
| `isSlotLocked(node)`        | Check if slot is locked               |
| `isSlotEditable(node)`      | Check if slot is editable             |
| `isSlotDynamic(node)`       | Check if slot is dynamic              |
| `getNodesInSlot()`          | Get all nodes in a slot               |
| `getSlotFallback()`         | Get slot fallback node                |
| `getSlotConstraints()`      | Get slot constraints                  |
| `validateSlots()`           | Validate all slot assignments         |

### Host Data

| Export                         | Description                        |
|--------------------------------|------------------------------------|
| `DEFAULT_SAMPLE_PRODUCTS`      | Sample product data for preview    |
| `DEFAULT_SAMPLE_COLLECTIONS`   | Sample collection data             |
| `DEFAULT_SAMPLE_SETTINGS`      | Sample site settings               |
| `buildHostData(raw)`           | Build normalized host data         |

### Default Page Schemas

| Export                       | Description                         |
|------------------------------|-------------------------------------|
| `createHomeSchema()`         | Home page schema                    |
| `createProductsSchema()`     | Products listing schema             |
| `createFAQSchema()`          | FAQ page schema                     |
| `createContactSchema()`      | Contact page schema                 |
| `createHelpSchema()`         | Help center schema                  |
| `createPrivacySchema()`      | Privacy policy schema               |
| `createTermsSchema()`        | Terms of service schema             |
| `createWishlistSchema()`     | Wishlist page schema                |
| `PAGE_DEFINITIONS`           | All page definitions                |
| `getDefaultSchemaForSlug(s)` | Get default schema for a slug       |

### i18n

| Export                        | Description                        |
|-------------------------------|------------------------------------|
| `setLocale(locale)`           | Set custom locale object           |
| `setLocaleByCode(code)`       | Set locale by code ('es'/'en')     |
| `t(key)`                      | Translate a key                    |
| `es` / `en`                   | Built-in locale objects            |
| `translateCategory(cat)`      | Translate block category name      |

### Types (TypeScript)

All types are exported for full TypeScript support:

```typescript
import type {
  Schema, SchemaNode, NodeType, BuiltInNodeType, NodeProps, NodeStyle,
  ThemeTokens, Page, PageDefinition, RenderMode, TemplateType, AnimationPreset,
  RenderContext, PageContext, DataBinding, NodeBindings, NodeDataSource,
  BoundSchemaNode, SlotBehavior, SlotAssignment,
  PublishStage, ValidatorOptions, PublishPipeline,
  TextNodeProps, ImageNodeProps, ButtonNodeProps,
  ProductCardNodeProps, ProductGridNodeProps, CollectionGridNodeProps,
  HeroSectionNodeProps, ImageBannerNodeProps, RichTextSectionNodeProps,
  CTASectionNodeProps, TestimonialSectionNodeProps, FAQSectionNodeProps,
  NavbarNodeProps, FooterNodeProps,
  NodeComponentProps, NodeComponent, CustomComponentMap,
  BlockDefinition, InspectorFieldDef, CompositeNodeTree,
  PageType, PageMetadata, VisibilityRule, DeviceVisibility,
  BuilderLocale, PublishPayload, SchemaValidationResult,
  PublishValidationResult, ValidationIssue,
  BuildRenderContextOptions, SlotConstraints, PageSchemaDefinition,
} from '@mandolop97/constructor-nexora';
```

### Constants

| Export              | Description                               |
|---------------------|-------------------------------------------|
| `EDITOR_VERSION`    | Current editor version string             |
| `ANIMATION_PRESETS` | Map of animation preset → CSS animation   |

---

## 16. Integration Examples

### Minimal Setup

```tsx
import { NexoraBuilderApp } from '@mandolop97/constructor-nexora';
import '@mandolop97/constructor-nexora/styles.css';

export default function BuilderPage() {
  return (
    <NexoraBuilderApp
      onSave={(schema) => console.log('Saved:', schema)}
      locale="en"
    />
  );
}
```

### E-Commerce Template with Data

```tsx
import { NexoraBuilderApp, buildRenderContext } from '@mandolop97/constructor-nexora';
import '@mandolop97/constructor-nexora/styles.css';

export default function StoreBuilder({ products, collections, settings }) {
  const renderContext = buildRenderContext({
    mode: 'edit',
    products,
    collections,
    settings,
  });

  return (
    <NexoraBuilderApp
      initialSchema={savedSchema}
      renderContext={renderContext}
      hostData={{ products, collections, settings }}
      onSave={(schema) => api.saveSchema(schema)}
      onPublishSubmit={async (payload) => api.publish(payload)}
      locale="en"
    />
  );
}
```

### Standalone Renderer (Published Site)

```tsx
import { PageRenderer, buildRenderContext, CustomStylesInjector } from '@mandolop97/constructor-nexora';
import '@mandolop97/constructor-nexora/styles.css';

export default function PublicPage({ schema, products, settings }) {
  const ctx = buildRenderContext({
    mode: 'public',
    page: { pageType: 'home', slug: '/' },
    products,
    settings,
  });

  return (
    <>
      <CustomStylesInjector css={schema.customCSS} />
      <PageRenderer schema={schema} mode="public" renderContext={ctx} />
    </>
  );
}
```

### Custom Block Extension

```tsx
import { NexoraBuilderApp } from '@mandolop97/constructor-nexora';
import type { NodeComponent, BlockDefinition } from '@mandolop97/constructor-nexora';

const CountdownTimer: NodeComponent = ({ node }) => (
  <div className="countdown">
    <h3>{node.props.heading || 'Sale ends in'}</h3>
    <span>{node.props.targetDate || '2025-12-31'}</span>
  </div>
);

const countdownBlock: BlockDefinition = {
  type: 'CountdownTimer',
  label: 'Countdown Timer',
  category: 'Marketing',
  canHaveChildren: false,
  defaultProps: { heading: 'Sale ends in', targetDate: '2025-12-31' },
  inspectorFields: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'targetDate', label: 'Target Date', type: 'text', placeholder: 'YYYY-MM-DD' },
  ],
};

<NexoraBuilderApp
  customComponents={{ CountdownTimer }}
  extraBlocks={[countdownBlock]}
/>
```

---

*This documentation is auto-generated and ships with the `@mandolop97/constructor-nexora` NPM package. For the latest version, check the package source.*
