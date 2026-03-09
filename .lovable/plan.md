

# Nexora Universal Contract v1.7.0 — Plan de Implementación

## 1. Contrato Final en TypeScript

### `RenderContext` (oficial v1.7.0)

```typescript
export interface RenderContext {
  mode: RenderMode;
  
  /** Page-level context */
  page: PageContext;
  
  /** All data for binding resolution */
  data: {
    /** E-commerce data */
    products: any[];
    collections: any[];
    
    /** CMS / content pages */
    pages: any[];
    
    /** Global site settings (store name, currency, etc.) */
    settings: Record<string, any>;
    
    /** Card template schema for hydration (ProductGrid uses this) */
    cardTemplate?: {
      nodes: Record<string, SchemaNode>;
      rootNodeId: string;
      themeTokens?: ThemeTokens;
    };
    
    /** Host-defined custom data sources */
    custom: Record<string, any>;
  };
  
  /** Iteration context (set by collection renderers like ProductGrid) */
  currentItem?: any;
  currentIndex?: number;
  
  /** Theme tokens snapshot */
  theme?: ThemeTokens;
  
  /** Asset URL resolver */
  resolveAssetUrl?: (path: string) => string;
}
```

### `PageContext` (oficial v1.7.0)

```typescript
export interface PageContext {
  pageType: PageType;
  slug: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  mode: RenderMode;            // replaces isPreview boolean
  metadata?: PageMetadata;
}
```

### Slot Contract

```typescript
export type SlotBehavior = 'locked' | 'editable' | 'dynamic';

export interface SlotAssignment {
  /** Slot identifier (e.g. 'header', 'footer', 'main', 'sidebar') */
  __slot: string;
  /** Slot behavior — locked: no changes; editable: content changes ok; dynamic: data-driven */
  behavior: SlotBehavior;
  /** Fallback node ID if slot is empty */
  fallbackNodeId?: string;
}
```

Added to `SchemaNode`:

```typescript
export interface SchemaNode {
  // ... existing fields ...
  /** Slot assignment for template integration */
  slot?: SlotAssignment;
}
```

### Naming Refactor

| Old name | New name | Scope |
|---|---|---|
| `mockData` (prop) | `hostData` | NexoraBuilderApp, PageDefinition, PageRenderer, BuilderCanvas, CommerceNodes |
| `externalMockData` | `externalHostData` | BuilderEditorShell, NexoraBuilderApp |
| `buildMockRenderData` | `buildHostData` | mock-data.ts → host-data.ts |
| `DEFAULT_MOCK_*` | `DEFAULT_SAMPLE_*` | host-data.ts |
| `mock_data` (DB column) | unchanged (DB stays) | Only rename the TS mapping layer |

### Publication Flow Contract

```typescript
export type PublishStage = 'draft' | 'validated' | 'preview' | 'published';

export interface PublishPipeline {
  /** 1. Save work-in-progress */
  saveDraft: (schema: Schema) => Promise<void>;
  /** 2. Run validation — must pass with 0 errors to proceed */
  validate: (schema: Schema, opts?: ValidatorOptions) => PublishValidationResult;
  /** 3. Generate preview (optional) */
  preview?: (schema: Schema) => Promise<string>; // returns preview URL
  /** 4. Publish to production */
  publish: (payload: PublishPayload) => Promise<void>;
}
```

Rules: `validate.errors.length > 0` blocks publish. Warnings are shown but don't block.

### Data Ownership Policy

```text
┌─────────────┬────────────────────┬───────────────────┐
│ Layer       │ Responsibility     │ Prohibitions      │
├─────────────┼────────────────────┼───────────────────┤
│ Host/Template│ fetch + adapt data │ Cannot modify     │
│ (consumer)  │ Build RenderContext│ schema nodes      │
│             │ Provide hostData   │                   │
├─────────────┼────────────────────┼───────────────────┤
│ Builder     │ Schema CRUD        │ NO fetch to       │
│ (editor)    │ Adapt hostData for │ external APIs     │
│             │ preview. Validates │ NO direct DB calls│
│             │ before publish     │ for biz data      │
├─────────────┼────────────────────┼───────────────────┤
│ Renderer    │ Render nodes from  │ NO fetch. NO      │
│ (PageRender)│ schema + resolved  │ state mutation.   │
│             │ context. Pure.     │ Read-only.        │
└─────────────┴────────────────────┴───────────────────┘
```

## 2. Files to Modify

| File | Change |
|---|---|
| `src/types/contract.ts` | Rewrite RenderContext, add PageContext import, SlotAssignment, PublishPipeline, bump to v1.7.0 |
| `src/types/schema.ts` | Add `slot?: SlotAssignment` to SchemaNode, remove duplicate PageContext |
| `src/types/page-types.ts` | Update PageContext to use `mode: RenderMode` instead of `isPreview` |
| `src/lib/mock-data.ts` | Rename file to `src/lib/host-data.ts`, rename exports |
| `src/lib/mock-data.ts` | Keep as re-export shim for backward compat (deprecated) |
| `src/NexoraBuilderApp.tsx` | `mockData` → `hostData`, `externalMockData` → `externalHostData`, keep `mockData` as deprecated alias |
| `src/components/builder/BuilderEditorShell.tsx` | `externalMockData` → `externalHostData` |
| `src/components/builder/BuilderCanvas.tsx` | `mockData` → `hostData`, import from host-data |
| `src/components/schema/PageRenderer.tsx` | `mockData` → `hostData` |
| `src/components/schema/nodes/CommerceNodes.tsx` | `mockData` → `hostData` |
| `src/index.ts` | Update exports, add SlotAssignment, PageContext re-export, deprecation aliases |
| `src/lib/version.ts` | (auto via build — no manual change needed) |
| `src/pages/Builder.tsx` | `mockData` → `hostData` in local page definitions |
| `src/lib/publish-validator.ts` | No structural changes — already correct |

## 3. Slot Render Rules

```text
SlotBehavior:
  locked    → Render as-is. Inspector disabled. Cannot delete/move.
  editable  → Render normally. Full inspector access. Can reorder children.
  dynamic   → Data-driven. Bindings resolved at render. Children generated from data.
  
Fallback:
  If slot has no children AND fallbackNodeId is set → render fallback node.
  If slot has no children AND no fallback → render empty placeholder (edit mode only).
```

## 4. Checklist de Integración V1

- [ ] Rewrite `RenderContext` in contract.ts with `page: PageContext` and `data` structure
- [ ] Add `SlotAssignment` type and add `slot?` field to `SchemaNode`
- [ ] Update `PageContext` in page-types.ts: add `mode: RenderMode`, remove `isPreview`
- [ ] Create `src/lib/host-data.ts` with renamed exports
- [ ] Create backward-compat shim at `src/lib/mock-data.ts`
- [ ] Rename `mockData` → `hostData` across all component props (9 files)
- [ ] Add `PublishPipeline` interface to contract.ts
- [ ] Update `src/index.ts` exports
- [ ] Add deprecated aliases in NexoraBuilderApp props for `mockData` and `renderContext`
- [ ] Update `.lovable/nexora-docs.md` with v1.7.0 contract reference
- [ ] Verify build compiles cleanly
- [ ] Test: builder loads with hostData, commerce nodes resolve data, publish flow works

