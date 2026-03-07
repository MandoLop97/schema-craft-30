# Nexora Visual Builder — Documentación Interna

## 1. Arquitectura General

El constructor sigue un modelo **schema-first**: toda la UI se describe como un árbol JSON (`Schema`) que se renderiza recursivamente vía `PageRenderer`.

### Tres modos de renderizado (`RenderMode`)
| Modo | Uso | Características |
|------|-----|-----------------|
| `edit` | Builder visual | Outlines de selección, drop zones, drag & drop |
| `preview` | Vista previa limpia | Sin controles de edición |
| `public` | Sitio publicado | Producción, sin dependencias del editor |

### Flujo de datos
```
Host App
  └─ <NexoraBuilderApp initialSchema={...} onSave={...} />
       └─ BuilderEditorShell (estado interno del schema)
            ├─ TopBar (acciones: guardar, publicar, preview, export)
            ├─ BlocksPalette (sidebar izq: bloques arrastrables)
            ├─ BuilderCanvas (canvas central con PageRenderer en modo edit)
            └─ Inspector (sidebar der: props, estilos, theme)
```

---

## 2. Tipos Principales (`src/types/schema.ts`)

### `Schema`
```ts
{ id, version, updatedAt, themeTokens, rootNodeId, nodes: Record<string, SchemaNode> }
```
Flat map de nodos. `rootNodeId` apunta al nodo raíz. Los hijos se referencian por ID en `children: string[]`.

### `SchemaNode`
```ts
{ id, type: NodeType, props: NodeProps, style: NodeStyle, children: string[],
  locked?, hidden?, customName?, customCSS? }
```

### `NodeType`
Tipos built-in: `Section`, `Container`, `Grid`, `Stack`, `Text`, `Image`, `Button`, `Card`, `Input`, `Divider`, `Badge`, `Spacer`, `Icon`, `SocialIcons`, `ProductCard`, `Navbar`, `Footer`, `AnnouncementBar`, `FeatureBar`, `TestimonialCard`, `NewsletterSection`, `HeroSection`, `Accordion`, `TabsBlock`, `VideoEmbed`, `FormBlock`.

Extensible con `string & {}` para tipos custom del host.

### `NodeStyle`
Objeto con ~80 propiedades CSS (layout, tipografía, fondo, bordes, sombras, transforms, animaciones) + sub-objetos:
- `hover`, `focus`, `active` — overrides por pseudo-estado
- `responsive.{sm|md|lg|xl}` — overrides por breakpoint (genera `@container` queries)

### `NodeProps`
Props semánticas del nodo: `text`, `href`, `src`, `alt`, `label`, `price`, `links[]`, `items[]`, `panels[]`, `videoUrl`, etc. Acepta `[key: string]: any` para props custom.

### `ThemeTokens`
```ts
{ colors: { primary, secondary, background, text, muted, border, accent? },
  typography: { fontFamily, baseSize, headingScale },
  radius: { sm, md, lg },
  spacing: { xs, sm, md, lg, xl },
  gradient? }
```

### `PageDefinition`
```ts
{ slug, title, schema, status?, templateType?, category?, icon?, canvasSize?, mockData? }
```
Define una página en el sistema multi-page.

---

## 3. Componentes Clave

### `NexoraBuilderApp` (`src/NexoraBuilderApp.tsx`)
Entry point del editor. Props principales:
- `initialSchema` — schema inicial (prioridad sobre pages)
- `pages` / `activePage` / `onPageChange` — sistema multi-página
- `onSave` / `onSaveWithSlug` — callbacks de guardado
- `onPublish` / `onPublishSubmit` — publicación
- `locale` — `'es'` | `'en'` | `BuilderLocale` custom
- `customComponents` — mapa `NodeType → React.FC<NodeComponentProps>`
- `extraBlocks` — `BlockDefinition[]` adicionales
- `customStylesheets` / `customCSS` / `customScripts` — inyección en canvas
- `onImageUpload` — callback para subir imágenes
- `resolveAssetUrl` — resolver rutas de assets

### `BuilderEditorShell`
Layout de 4 zonas: TopBar, sidebar izquierda (BlocksPalette + LayersPanel), canvas central, Inspector derecho. Mantiene el estado del schema con undo/redo (`useSchemaHistory`).

### `PageRenderer` (`src/components/schema/PageRenderer.tsx`)
Renderizador recursivo. Recorre el árbol desde `rootNodeId`, resuelve cada nodo por `NodeRegistry`, e inyecta:
- CSS de pseudo-estados y responsive vía `<style>` tags
- `data-node-id` para selección en modo edit
- Drop zones editables (`EditableDropZone`)

### `NodeRegistry` (`src/components/schema/NodeRegistry.tsx`)
Mapa estático `NodeType → NodeComponent`. Función `getNodeComponent(type, customComponents?)` busca primero en custom, luego en built-in.

```ts
interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
  mockData?: Record<string, any>;
}
```

### `Inspector` (`src/components/builder/Inspector.tsx`)
Panel derecho con tabs: propiedades del nodo, estilos, y configuración avanzada. Los campos se generan dinámicamente desde `BlockDefinition.inspectorFields`.

### `ThemeEditor` (`src/components/builder/ThemeEditor.tsx`)
Editor de tokens globales (colores, tipografía, radios, spacing). Cambios se propagan como CSS variables al canvas.

### `PageManager` (`src/components/builder/PageManager.tsx`)
Selector de páginas. Se muestra cuando `pages` existe pero `activePage` no está definido.

---

## 4. Sistema de Bloques (`src/lib/block-registry.ts`)

### `BlockDefinition`
```ts
{ type: NodeType, label, icon?, category,
  canHaveChildren, defaultProps?, defaultStyle?,
  inspectorFields: InspectorFieldDef[],
  compositeFactory?: () => CompositeNodeTree,
  templateType?: TemplateType }
```

### Inspector Fields
```ts
{ key, label, type: 'text'|'textarea'|'select'|'color'|'number'|'switch'|'image'|'links'|'items'|'panels'|'icon', options? }
```

### Composite Blocks
`compositeFactory` retorna `{ rootId, nodes }` — un mini-árbol de nodos pre-armado (ej: HeroSection con Container + Text + Button).

### API del Registry
- `registerBlock(def)` / `registerBlocks(defs[])` — registrar bloques
- `getBlockDef(type)` — obtener definición
- `getCategories()` / `getBlocksByCategory(cat)` — listar
- `getCategoriesForTemplate(templateType)` — filtrar por template

---

## 5. Node Factory (`src/lib/node-factory.ts`)

- `createNode(type)` — crea un nodo con defaults del registry
- `createNodeTree(type)` — si tiene `compositeFactory` retorna el árbol compuesto, si no un nodo simple
- `duplicateNodeTree(sourceId, nodes)` — deep-clone con IDs nuevos
- `isContainerType(type)` — verifica si acepta hijos

---

## 6. Sistema de Estilos (`src/lib/style-utils.ts`)

### `nodeStyleToCSS(style)`
Convierte `NodeStyle` a `React.CSSProperties`. Maneja `backgroundGradient` como capa sobre `backgroundImage`.

### `generatePseudoStateCSS(nodeId, style)`
Genera reglas CSS para `:hover`, `:focus`, `:active` usando `[data-node-id="..."]` como selector. Añade `transition: all 0.2s ease` automáticamente.

### `generateResponsiveCSS(nodeId, style)`
Genera `@container (min-width: ...)` queries para breakpoints sm/md/lg/xl.

### CSS Scoping
Todo el editor vive dentro de `.nxr-editor` que define variables fallback para tokens de Tailwind/Shadcn, evitando conflictos con el host.

---

## 7. Theme Tokens → CSS Variables

`ThemeTokens` se inyectan como CSS custom properties en el canvas:
```css
--primary: [value]
--secondary: [value]
--background: [value]
--foreground: [value]  /* = text */
--muted: [value]
--border: [value]
--accent: [value]
--radius: [value]      /* = radius.md */
--font-family: [value]
--font-size-base: [value]
```

El `ThemeEditor` actualiza estos tokens en el schema, que se re-inyectan en tiempo real.

---

## 8. Sistema Multi-Página

```tsx
<NexoraBuilderApp
  pages={[
    { slug: 'home', title: 'Inicio', schema: {...}, templateType: 'page' },
    { slug: 'header', title: 'Header', schema: {...}, templateType: 'header', canvasSize: { width: 1200, height: 80 } },
  ]}
  activePage="home"
  onPageChange={(slug) => setActivePage(slug)}
  onSaveWithSlug={(slug, schema) => saveToDb(slug, schema)}
/>
```

### Template Types
- `page` — página completa
- `header` / `footer` — fragmentos de sitio
- `component` — componente reutilizable
- `single` — pieza única (ej: banner)

### Canvas Size
`canvasSize: { width, height }` permite dimensiones custom por página (ej: header 1200×80).

---

## 9. Persistencia

El builder es **stateless respecto al storage**. El host controla la persistencia:

```tsx
onSave={(schema) => {
  // Guardar en DB, localStorage, API, etc.
}}
onSaveWithSlug={(slug, schema) => {
  // Guardar schema asociado a un slug de página
}}
onPublish={(schema) => {
  // Publicar el schema
}}
onPublishSubmit={async (payload: PublishPayload) => {
  // payload: { domain, pages, status }
}}
```

---

## 10. Extensibilidad

### Custom Components
```tsx
const MyWidget: NodeComponent = ({ node, mode, renderChildren }) => (
  <div>{node.props.text}</div>
);

<NexoraBuilderApp
  customComponents={{ MyWidget }}
  extraBlocks={[{
    type: 'MyWidget',
    label: 'Mi Widget',
    category: 'Custom',
    canHaveChildren: false,
    defaultProps: { text: 'Hola' },
    inspectorFields: [{ key: 'text', label: 'Texto', type: 'text' }],
  }]}
/>
```

### Custom Styles
```tsx
<NexoraBuilderApp
  customStylesheets={['https://cdn.example.com/theme.css']}
  customCSS=".my-class { color: red; }"
  customScripts={['https://cdn.tailwindcss.com']}
/>
```

---

## 11. Internacionalización (i18n)

```tsx
// Usar locale predefinido
<NexoraBuilderApp locale="es" />

// Usar locale custom
<NexoraBuilderApp locale={{
  save: 'Guardar',
  publish: 'Publicar',
  // ... todas las keys
}} />
```

API programática: `setLocaleByCode('en')`, `setLocale(customLocale)`, `t('save')`.

---

## 12. Exports del Paquete (`src/index.ts`)

| Export | Uso |
|--------|-----|
| `NexoraBuilderApp` | Componente principal del editor |
| `PageRenderer` | Renderizar schemas fuera del builder |
| `CustomStylesInjector` | Inyectar CSS custom en render público |
| `blockRegistry`, `registerBlock` | Inspeccionar/extender bloques |
| `createNode`, `createNodeTree` | Crear nodos programáticamente |
| `validateSchema` | Validar schemas |
| `PAGE_DEFINITIONS`, `getDefaultSchemaForSlug` | Schemas por defecto para cada tipo de página |
| Tipos: `Schema`, `SchemaNode`, `NodeType`, `NodeStyle`, etc. | TypeScript types |
