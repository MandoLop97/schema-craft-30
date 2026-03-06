

## Plan: Nested Drag-and-Drop (estilo Elementor)

### Problema actual

El builder tiene **una sola zona de drop** (`canvas-drop`) que cubre todo el canvas. Cuando arrastras un bloque, se inserta en el nodo seleccionado o en el root, sin importar dónde lo sueltes visualmente. No hay forma de soltar un bloque **dentro** de una Section, Grid o Container específico, ni se ven indicadores de inserción.

### Qué se va a construir

Convertir cada nodo contenedor (Section, Container, Grid, Stack) en una **zona droppable individual** con indicadores visuales, para que al arrastrar un bloque desde la paleta puedas soltarlo exactamente donde quieres, respetando columnas y jerarquía.

### Cambios técnicos

**1. PageRenderer.tsx -- Zonas droppables por nodo contenedor**

- En modo `edit`, envolver cada nodo que tenga `canHaveChildren=true` con un `useDroppable` de dnd-kit, usando el `node.id` como droppable ID.
- Mostrar un indicador visual (borde highlight o fondo semitransparente) cuando se hace hover con un bloque encima.
- Mostrar un placeholder "Drop here" cuando el contenedor está vacío.

**2. BuilderEditorShell.tsx -- Resolver drop target por `over.id`**

- En `handleDragEnd`, usar `over.id` para determinar el nodo padre real donde insertar, en lugar de depender de `selectedNodeId`.
- Validar que el target es un contenedor válido antes de insertar.
- Eliminar la lógica actual que busca el padre del nodo seleccionado.

**3. BuilderCanvas.tsx -- Quitar el droppable global**

- Eliminar el `useDroppable({ id: 'canvas-drop' })` del canvas wrapper, ya que cada nodo contenedor será su propia zona de drop.
- Mantener el canvas como wrapper visual sin lógica de drop.

**4. Componente EditableDropZone (nuevo)**

- Componente wrapper reutilizable que:
  - Usa `useDroppable({ id: nodeId })` de dnd-kit.
  - Muestra outline azul cuando `isOver` y el drag activo es de tipo `palette`.
  - Muestra un placeholder visual cuando `children.length === 0` y hay un drag activo.
- Se usará dentro de `PageRenderer` para envolver los nodos contenedores en modo edit.

**5. Indicadores visuales**

- Contenedor hover: borde punteado azul + fondo `primary/5`.
- Contenedor vacío durante drag: área con texto "Drop block here" + icono.
- Badge del tipo de nodo ya existente se mantiene.

### Flujo resultante

```text
Paleta (drag) ──> hover sobre Grid ──> Grid muestra borde azul
                                    ──> soltar ──> bloque se inserta como hijo del Grid
                                    ──> respeta las columnas del Grid
```

### Archivos afectados

| Archivo | Acción |
|---|---|
| `src/components/schema/EditableDropZone.tsx` | Crear nuevo |
| `src/components/schema/PageRenderer.tsx` | Envolver contenedores con EditableDropZone |
| `src/components/builder/BuilderEditorShell.tsx` | Usar `over.id` como parent target |
| `src/components/builder/BuilderCanvas.tsx` | Quitar droppable global |

