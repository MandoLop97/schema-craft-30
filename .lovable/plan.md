
## Instrucción permanente: Versionado automático

**IMPORTANTE**: Cada vez que se haga un cambio en el proyecto, incrementar la versión en:
1. `package.json` → campo `"version"`
2. `src/components/builder/BuilderEditorShell.tsx` → texto de versión en el status bar

Formato: semver (major.minor.patch). Incrementar el **patch** (+1) en cada cambio. Versión actual: **1.1.1**

---

## Phase 1: Schema-First Foundation + eCommerce Home

### Overview
Build the core schema system, page renderer, storage layer, and a clean eCommerce Home page — all driven by JSON schema. This foundation makes Phase 2 (Builder UI) straightforward to add.

---

### 1. Schema Types & Data Model
Define TypeScript types for the entire schema system:
- **Page** (id, slug, name, schemaId)
- **Schema** (id, version, updatedAt, themeTokens, rootNodeId, nodes map)
- **Node** (id, type, props, style, children, locked, hidden)
- **ThemeTokens** (colors, typography, radius, spacing)
- Support all node types: Section, Container, Grid, Stack, Text, Image, Button, Card, Badge, Divider, Input, ProductCard, Navbar, Footer

### 2. Schema Store (LocalStorage)
Create an abstraction layer (`SchemaStore`) with clean API:
- `getPages()`, `getPageBySlug()`, `getSchema()`, `saveSchema()`
- `createPage()`, `duplicatePage()`, `deletePage()`, `renamePage()`
- All backed by LocalStorage, designed so swapping to a database later only changes the store internals

### 3. Node Registry & Components
Build a component for each node type, all receiving props/style from schema:
- **Layout**: Section, Container, Grid, Stack
- **Content**: Text, Image, Divider, Badge
- **UI**: Button, Card, Input
- **Commerce**: ProductCard (mock with image, title, price, CTA)
- **Site**: Navbar, Footer

### 4. PageRenderer
Core rendering engine:
- Takes a schema + mode (`public` | `preview` | `edit`)
- Recursively renders nodes from the tree using the Node Registry
- In `public`/`preview` mode: clean output, no editing UI
- In `edit` mode: adds selection outlines and drop zones (prepared for Phase 2)
- Applies ThemeTokens as CSS variables

### 5. eCommerce Home Page (Schema-based)
Create a default `home` schema that produces a modern eCommerce landing page:
- **Navbar** with logo and navigation links
- **Hero section** with headline, subtext, and CTA button
- **Featured products grid** with 3-4 ProductCard mocks
- **Value propositions** section (icons + text)
- **Footer** with links and copyright
- Clean, minimal design inspired by modern eCommerce (think Stripe/Linear aesthetics)

### 6. Route Setup
- `/` → Renders Home from schema via PageRenderer (public mode)
- `/preview?page=home` → Same but in preview mode
- `/admin/export?page=home` → Shows raw JSON schema with copy button
- `/license-blocked` → Placeholder lock screen

### 7. License Gate (Mock)
- `license_status` stored in LocalStorage (active/inactive/exceeded)
- Admin routes check license; public site always works
- `/license-blocked` shows status, reason, and placeholder "Enter License" button

---

### What's NOT in Phase 1 (saved for Phase 2)
- Full Builder UI (drag & drop canvas, left/right sidebars, inspector)
- Undo/Redo history
- AI Edit feature
- Templates management (`/admin/templates`)
- Theme editor (`/admin/theme`)
- Device toggle & responsive overrides

### Design Style
Minimal, professional SaaS aesthetic — light background, clean typography, subtle borders, polished hover states.

## ⚠️ REGLA FUNDAMENTAL: Alcance del proyecto

**Este proyecto es un CONSTRUCTOR VISUAL (Builder) al 100%.** Su única responsabilidad es:
1. Permitir diseñar y personalizar visualmente: **Header (Navbar)**, **Footer** y **Product Cards**
2. Generar y guardar esquemas JSON en la base de datos
3. Previsualizar el resultado en el canvas

**NO es responsabilidad de este proyecto:**
- Administrar productos (CRUD de productos) — eso lo hace la app consumidora (Template)
- Gestionar inventario, pedidos o usuarios finales
- Lógica de negocio, licencias o acceso al sitio final
- Los productos y medios se **leen** de la base de datos para usarlos en el diseño, pero **no se crean ni editan** desde aquí

**Los únicos componentes 100% editables/personalizables en el Builder son:**
- **Navbar/Header**: logo, links, colores, estilos
- **Footer**: logo, copyright, links, estilos  
- **Product Cards**: layout, estilos, botones, imagen ratio, tipografía

Las demás secciones del canvas (Hero, Sections, Grids, etc.) son bloques de contenido arrastrables y configurables pero NO tienen editores dedicados.

---
