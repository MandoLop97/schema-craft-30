

## Plan: Paridad con Elementor Pro — 7 funcionalidades

Este es un conjunto grande de mejoras. Se implementarán en orden de impacto y complejidad.

---

### 1. Responsive Editing por Breakpoint

**Qué**: Iconos de dispositivo (desktop/tablet/mobile) junto a cada campo de estilo en el Inspector. Al cambiar dispositivo, los valores se editan dentro de `node.style.responsive.{sm|md|lg}`.

**Cómo**:
- Pasar el `device` actual del `BuilderEditorShell` al `Inspector` como nueva prop
- En `StyleTab`, envolver cada campo con un componente `ResponsiveFieldWrapper` que muestra 3 iconos (Monitor/Tablet/Smartphone) como toggle
- Cuando el breakpoint activo no es "desktop", los cambios se escriben en `style.responsive[bp]` en vez de en `style` directo
- Mostrar un indicador visual (punto azul) cuando un campo tiene override responsive

**Archivos**: `Inspector.tsx`, `BuilderEditorShell.tsx`

---

### 2. States Editing UI (Normal/Hover/Focus/Active)

**Qué**: Tabs de estado en la parte superior de `StyleTab` para editar estilos por pseudo-estado.

**Cómo**:
- Agregar un selector de estado (Normal | Hover | Focus | Active) al inicio de `StyleTab`
- Cuando un estado != "normal" está activo, los campos leen/escriben desde `style.hover`, `style.focus` o `style.active`
- Reutilizar los mismos campos existentes (`renderField`, `renderSelect`, `ColorField`) pero redirigiendo la lectura/escritura al sub-objeto del estado activo
- Eliminar la sección colapsable "Estado: Hover" actual (se reemplaza por los tabs)

**Archivos**: `Inspector.tsx`

---

### 3. Previsualización de Hover en Canvas

**Qué**: Al hacer hover sobre un nodo en edit mode, aplicar visualmente los estilos hover definidos en el schema.

**Cómo**:
- Ya se generan reglas CSS con `generatePseudoStateCSS` inyectadas via `<style>`. Estas reglas ya usan `:hover`
- El problema es que `SortableNodeWrapper` bloquea el hover del elemento interior por sus propias capas
- Agregar `pointer-events: auto` al nodo interior dentro del wrapper y asegurar que el `data-node-id` esté en el elemento correcto
- Verificar que las reglas CSS pseudo generadas aplican correctamente en edit mode

**Archivos**: `SortableNodeWrapper.tsx`, `PageRenderer.tsx`

---

### 4. Motion Effects (Scroll Animations)

**Qué**: Animaciones de entrada al scroll (fade in, slide up, scale in) configurables por nodo.

**Cómo**:
- Agregar prop `scrollAnimation` al tipo `NodeProps`: `'fadeIn' | 'slideUp' | 'slideLeft' | 'scaleIn' | 'none'`
- Agregar prop `scrollAnimationDelay` y `scrollAnimationDuration`
- En `Inspector.tsx` (PropsTab o StyleTab), agregar sección "Animación al Scroll" con selector de efecto + delay + duración
- Crear un componente wrapper `ScrollAnimationWrapper` que usa `IntersectionObserver` para agregar clase CSS cuando el nodo entra al viewport
- En `PageRenderer`, envolver nodos que tengan `scrollAnimation` con este wrapper (solo en modo public/preview, no edit)
- Definir los keyframes CSS necesarios en `index.css`

**Archivos**: `Inspector.tsx`, `PageRenderer.tsx`, nuevo `src/components/schema/ScrollAnimationWrapper.tsx`, `index.css`, `schema.ts` (agregar tipos)

---

### 5. Copiar/Pegar Estilos

**Qué**: "Copy Style" y "Paste Style" en el menú contextual de nodos.

**Cómo**:
- Agregar `clipboardStyleRef` en `BuilderEditorShell` para guardar un snapshot de `NodeStyle`
- Nuevos callbacks `onCopyStyle(nodeId)` y `onPasteStyle(nodeId)` que copian/pegan `node.style` completo
- Agregar opciones "Copiar Estilo" y "Pegar Estilo" al `ContextMenu` en `SortableNodeWrapper`
- Shortcut: Ctrl+Alt+C / Ctrl+Alt+V

**Archivos**: `BuilderEditorShell.tsx`, `SortableNodeWrapper.tsx`, `BuilderCanvas.tsx`, `PageRenderer.tsx`

---

### 6. Global Styles / Clases Reutilizables

**Qué**: Sistema de clases globales (ej. "heading-style-1") definidas en el schema y aplicables a múltiples nodos.

**Cómo**:
- Agregar `globalStyles` al tipo `Schema`: `Record<string, { label: string; style: Partial<NodeStyle> }>`
- Agregar `appliedGlobalStyles` a `SchemaNode`: `string[]` (IDs de global styles aplicados)
- En `ThemeEditor`, nueva sección "Estilos Globales" para crear/editar/eliminar clases
- En `Inspector`, mostrar selector de clases globales aplicadas al nodo, con indicador visual
- En `PageRenderer`/`style-utils`, mezclar estilos globales con estilos locales del nodo (local tiene prioridad)

**Archivos**: `schema.ts`, `ThemeEditor.tsx`, `Inspector.tsx`, `PageRenderer.tsx`, `style-utils.ts`

---

### 7. Responsive Preview Ruler

**Qué**: Mostrar dimensiones actuales (ej. "768 × 1024") en el canvas al cambiar de dispositivo.

**Cómo**:
- En `BuilderCanvas.tsx`, agregar un badge/label encima del canvas que muestre el ancho actual según el device seleccionado
- Formato: "375px" (mobile), "768px" (tablet), "100%" (desktop)
- Estilos sutiles, tooltip con nombre del breakpoint

**Archivos**: `BuilderCanvas.tsx`

---

### Orden de implementación

1. Responsive Preview Ruler (más simple, impacto visual rápido)
2. States Editing UI (reemplaza sección Hover actual)
3. Responsive Editing por Breakpoint
4. Previsualización de Hover en Canvas
5. Copiar/Pegar Estilos
6. Motion Effects (Scroll Animations)
7. Global Styles / Clases Reutilizables

### Estimación

~12 archivos modificados/creados. Cambios concentrados en `Inspector.tsx` (~40% del trabajo), `BuilderEditorShell.tsx`, `SortableNodeWrapper.tsx`, `BuilderCanvas.tsx`, `PageRenderer.tsx` y `schema.ts`.

