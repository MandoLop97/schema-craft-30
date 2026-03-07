

## Plan: Crear documentación interna del constructor Nexora

### Objetivo
Crear un archivo `.lovable/nexora-docs.md` con documentación completa de la arquitectura, tipos, componentes y flujo del constructor visual, para que esté siempre disponible como contexto del proyecto.

### Contenido de la documentación

El archivo cubrirá:

1. **Arquitectura general** — Schema-first, recursive renderer, 3 render modes
2. **Tipos principales** — Schema, SchemaNode, NodeType, NodeStyle, NodeProps, ThemeTokens, PageDefinition
3. **Componentes clave**:
   - `NexoraBuilderApp` — entry point, props API
   - `BuilderEditorShell` — 4-zone layout (TopBar, left sidebar, canvas, inspector)
   - `PageRenderer` — recursive node rendering + DnD in edit mode
   - `NodeRegistry` — maps NodeType → React component
   - `BlocksPalette` — draggable block catalog
   - `Inspector` — property/style editor panel
   - `ThemeEditor` — global theme tokens editor
   - `PageManager` — multi-page selector
4. **Sistema de bloques** — BlockDefinition, inspectorFields, compositeFactory, block categories
5. **Node factory** — createNode, createNodeTree, duplicateNodeTree
6. **Estilos** — NodeStyle to CSS, pseudo-states (hover/focus/active), responsive breakpoints, CSS scoping (.nxr-editor)
7. **ThemeTokens → CSS variables** — how tokens inject as --primary, --background, etc.
8. **Multi-page system** — pages prop, activePage, onPageChange, templateType, canvasSize
9. **Persistencia** — onSave/onSaveWithSlug callbacks, host provides DB logic
10. **Extensibilidad** — customComponents, extraBlocks, customStylesheets/CSS/Scripts
11. **i18n** — locale prop (es/en), setLocale/setLocaleByCode

### Archivo a crear
- `.lovable/nexora-docs.md` — documentación completa (~150-200 líneas)

### Sin cambios de código
No se modifica ningún archivo funcional. Solo se crea documentación de referencia.

