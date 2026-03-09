# Changelog

All notable changes to `@mandolop97/constructor-nexora` will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/).

---

## [1.7.1] — 2026-03-09

### Added
- **`NEXORA.md`** — Full public documentation shipped with the NPM package. Any developer or AI assistant can read the complete constructor reference from `node_modules/@mandolop97/constructor-nexora/NEXORA.md`.
- **JSDoc comments** on all export groups in `src/index.ts` with references to NEXORA.md sections for IDE hover documentation.
- **`CHANGELOG.md`** — This file, included in the published package.

### Changed
- `package.json` `"files"` field now includes `NEXORA.md` and `CHANGELOG.md` alongside `dist/`.

---

## [1.7.0] — 2026-03-08

### Added

#### Universal Contract v1.7.0
- **`RenderContext`** — Single source of truth for all rendering data. Replaces the old `mockData` pattern. Built by the host/template layer and consumed read-only by builder and renderer.
- **`PageContext`** — Runtime context for the current page (`pageType`, `slug`, `mode`, `params`, `query`, `metadata`).
- **`buildRenderContext()`** — Recommended factory for creating RenderContext in both builder and template modes.
- **`buildEditContext()`** — Shorthand for building edit-mode context with sample data.
- **`createIterationContext()`** — Create iteration context for collection rendering (e.g., ProductGrid).
- **`validateRenderContext()`** / **`isStrictRenderContext()`** — Validation helpers for debugging and migration.

#### Data Binding System
- **`DataBinding`** — Maps node props to data field paths with optional transforms.
- **`NodeBindings`** — Complete binding configuration per node (`dataSource`, `bindings`, `fallbackProps`, `mode`).
- **`NodeDataSource`** — Configurable data source with query/filter support.
- **`BoundSchemaNode`** — Extended schema node with binding + metadata support.
- Binding utilities: `resolveBindings()`, `hydrateTemplate()`, `hydrateNodeForItem()`, `resolveFieldPath()`, `setFieldPath()`, `createDefaultBindings()`, `hasActiveBindings()`, `getBoundProps()`.
- Transform system: `registerTransform()`, `getAvailableTransforms()`.

#### Slot System
- **`SlotAssignment`** — Template integration slots with `locked`, `editable`, and `dynamic` behaviors.
- Slot utilities: `getSlotAssignment()`, `isInSlot()`, `getSlotBehavior()`, `isSlotLocked()`, `isSlotEditable()`, `isSlotDynamic()`, `getNodesInSlot()`, `getSlotFallback()`, `getSlotConstraints()`, `validateSlots()`.

#### Publish Pipeline
- **`PublishPipeline`** — Formal contract for draft → validate → preview → publish flow.
- **`validateForPublish()`** — Pre-publish validation with errors and warnings.
- `PublishStage`, `ValidatorOptions` types.

#### New Node Types
- `ProductGrid` — Data-driven product grid with collection/category filtering, sorting, and card template hydration.
- `CollectionGrid` — Collection listing with configurable columns and display options.
- `ImageBanner` — Full-width image banner with overlay text and link.
- `RichTextSection` — Rich text content section with optional 2-column layout.
- `CTASection` — Call-to-action section with dual CTAs and background options.
- `TestimonialSection` — Testimonial display with grid/carousel/stack layouts.
- `FAQSection` — FAQ section with accordion or grid layouts.
- `FormBlock` — Form builder block.

#### Per-Node Prop Types
- Strongly typed props for every node type: `TextNodeProps`, `ImageNodeProps`, `ButtonNodeProps`, `ProductCardNodeProps`, `ProductGridNodeProps`, `CollectionGridNodeProps`, `HeroSectionNodeProps`, `ImageBannerNodeProps`, `RichTextSectionNodeProps`, `CTASectionNodeProps`, `TestimonialSectionNodeProps`, `FAQSectionNodeProps`, `NavbarNodeProps`, `FooterNodeProps`.

#### Page System
- **Page types:** `home`, `products`, `product-detail`, `collection`, `cart`, `checkout`, `faq`, `contact`, `help`, `privacy`, `terms`, `wishlist`, `custom`.
- `PageMetadata` — SEO metadata (title, description, OG tags, JSON-LD).
- `VisibilityRule`, `DeviceVisibility`, `LockedPropsConfig` — Granular control over block visibility and editability per page type.
- `PAGE_TYPE_LABELS`, `BLOCK_PAGE_TYPE_DEFAULTS`, `isBlockCompatibleWithPage()`.

#### Default Page Schemas
- 8 pre-built schema factories: `createHomeSchema()`, `createProductsSchema()`, `createFAQSchema()`, `createContactSchema()`, `createHelpSchema()`, `createPrivacySchema()`, `createTermsSchema()`, `createWishlistSchema()`.
- `PAGE_DEFINITIONS` — All page definitions with metadata.
- `getDefaultSchemaForSlug()` — Get default schema for any page slug.

#### Host Data
- `hostData` prop replaces `mockData` on `NexoraBuilderApp` and `PageDefinition`.
- `DEFAULT_SAMPLE_PRODUCTS`, `DEFAULT_SAMPLE_COLLECTIONS`, `DEFAULT_SAMPLE_SETTINGS` — Sample data for editor preview.
- `buildHostData()` — Normalize raw host data into the expected format.

#### Inspector Enhancements
- `binding` field type — Connect node props to data sources visually.
- `array` field type — Edit arrays of items with configurable sub-fields (`arrayFields`, `newItemDefaults`, `addLabel`, `maxItems`).
- `group` field type — Nested inspector field groups.

### Changed
- `NexoraBuilderApp` now accepts `renderContext` prop for full data context control.
- `NexoraBuilderApp` now accepts `hostData` prop (replaces deprecated `mockData`).
- `PageDefinition` now accepts `hostData` (replaces deprecated `mockData`).
- Block registry supports `templateType` filtering via `getCategoriesForTemplate()`.

### Deprecated
- `mockData` prop on `NexoraBuilderApp` — use `hostData` instead.
- `DEFAULT_MOCK_PRODUCTS`, `DEFAULT_MOCK_COLLECTIONS`, `DEFAULT_MOCK_SETTINGS`, `buildMockRenderData()` — use host-data equivalents.

---

## [1.4.0] — Previous Stable

- Master template system with dynamic hydration.
- Advanced design tools (Elementor Pro parity).
- Global styles system.
- Scroll animations with `AnimationPreset`.
- Multi-page system with `PageDefinition` and `PageManager`.
- Custom components and blocks extensibility.
- i18n with Spanish and English built-in.
- CSS scoping via `.nxr-editor`.
- Dynamic versioning via `EDITOR_VERSION`.
