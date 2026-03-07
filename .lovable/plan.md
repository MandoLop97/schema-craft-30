

## Plan: Navbar restricted to header templates + demo pages for verification + v1.0.9

### Changes

**1. Restrict Navbar to header templates** (`src/lib/block-registry.ts`, line 90)
- Add `allowedTemplateTypes: ['header']` to the Navbar block definition
- Also add `allowedTemplateTypes: ['footer']` to the Footer block for consistency

**2. Update demo Builder page** (`src/pages/Builder.tsx`)
- Replace the single-schema mode with a multi-page setup using `pages` prop
- Include pages across 3 categories with different `templateType` values:
  - **Páginas**: Home (page), Products (page)
  - **Elementos Globales**: Header (header), Footer (footer)
  - **Templates**: Product Card (component, with canvasSize 350x450 and mockData)
- This demonstrates all 3 features: PageManager grouping, canvas adaptation, and block filtering

**3. Bump version** (`package.json`, line 4)
- Change `"version": "1.0.8"` to `"1.0.9"`

### What this verifies
- Navbar block only appears in the palette when editing the "Header" page (templateType: 'header')
- PageManager groups pages into collapsible categories
- "Product Card" page shows checkerboard background with compact 350x450 canvas

