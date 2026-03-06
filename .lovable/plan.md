

## Plan: Multi-page system + Default schemas (v1.2.0)

### Summary

Add `PageDefinition` type, `pages`/`activePage`/`onPageChange`/`onSaveWithSlug` props to `NexoraBuilderApp`, a `PageManager` component shown when `pages` are provided but no `activePage` is set (or as a new left-sidebar tab), and a `defaultSchemas.ts` file with all 8 page schemas. Export everything from `src/index.ts`.

### Files to create

**`src/lib/default-schemas.ts`**
- Contains `sharedNavbar()`, `sharedFooter()`, and all 8 schema factory functions (Home, Products, FAQ, Contact, Help, Privacy, Terms, Wishlist)
- Exports `PAGE_DEFINITIONS` array, `getDefaultSchemaForSlug()`, and each individual `create*Schema()` function
- Uses existing `Schema` type with proper typing on `Record<string, SchemaNode>`

**`src/components/builder/PageManager.tsx`**
- Renders the page list UI provided by the user (styled with Tailwind instead of inline styles for consistency)
- Props: `pages: PageDefinition[]`, `activePage?: string`, `onSelectPage: (slug: string) => void`
- Shows page title, slug, status badge, and selection indicator

### Files to modify

**`src/types/schema.ts`**
- Add `PageDefinition` interface: `{ slug: string; title: string; schema: Schema; status?: 'published' | 'draft' }`

**`src/NexoraBuilderApp.tsx`**
- Add new props: `pages?`, `activePage?`, `onPageChange?`, `onSaveWithSlug?`
- When `pages` is provided and `activePage` is set, resolve `initialSchema` from `pages.find(p => p.slug === activePage)?.schema` (with `initialSchema` prop as override)
- When `pages` is provided but no `activePage`, show `PageManager` instead of the editor
- Pass `onSaveWithSlug` down: wrap `onSave` to also call `onSaveWithSlug(activePage, schema)` when available

**`src/components/builder/BuilderEditorShell.tsx`**
- Add `pages?` and `activePage?` and `onPageChange?` props
- Add a "Pages" tab in the left sidebar (alongside Blocks/Layers) that shows `PageManager` when `pages` is provided
- TopBar receives optional page title context

**`src/components/builder/TopBar.tsx`**
- Add optional `pageTitle?: string` and `onBackToPages?: () => void` props
- Show a back arrow + page title in the top bar when editing a specific page

**`src/index.ts`**
- Export `PageDefinition` type
- Export `PageManager` component
- Export all functions from `default-schemas.ts`: `PAGE_DEFINITIONS`, `getDefaultSchemaForSlug`, individual schema creators

**`src/components/builder/BlocksPalette.tsx`**
- Bump version to `v1.2.0`

**`package.json`**
- Bump version to `1.2.0`

### Behavior

1. **No `pages` prop** -- builder works exactly as before (single schema editor)
2. **`pages` + `activePage`** -- editor loads the active page's schema, left sidebar gets a "Pages" tab, TopBar shows page name with back button
3. **`pages` without `activePage`** -- shows `PageManager` full-screen for page selection
4. **`onPageChange(slug)`** -- called when user clicks a page in the Pages tab or back button; host controls navigation
5. **`onSaveWithSlug(slug, schema)`** -- called on save alongside `onSave`, providing slug context

### Version: 1.2.0

Minor bump for new public API surface (PageDefinition, PageManager, multi-page props, default schemas).

