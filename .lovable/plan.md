

## Plan: Posicionamiento absoluto de elementos sobre la imagen del ProductCard

### Problema actual
El Badge se inserta como hijo directo del ProductCard raíz, al mismo nivel que la imagen y el body. Esto significa que aunque tenga `position: absolute`, no se posiciona correctamente sobre la imagen porque depende de la estructura del padre. Además, no hay una forma intuitiva en el inspector de propiedades para controlar la posición de los elementos.

### Cambios propuestos

#### 1. Reestructurar el template del ProductCard (`src/lib/default-schemas.ts`)
- Envolver la imagen en un contenedor con `position: relative` y `overflow: hidden`
- Hacer que el Badge sea hijo de ese contenedor de imagen (no del ProductCard raíz)
- Así el Badge se posiciona naturalmente sobre la imagen con `position: absolute`
- Usar valores en `%` para top/left por defecto para que sea responsive

```text
ProductCard (root)
├── ImageWrapper (Container, position: relative)
│   ├── Image
│   └── Badge (position: absolute, top: 5%, left: 5%)
├── Body (Stack)
│   ├── Title (Text)
│   ├── PriceRow (Stack horizontal)
│   │   ├── Price (Text)
│   │   └── OriginalPrice (Text, line-through)
│   └── Button
```

#### 2. Agregar sección de "Posicionamiento Rápido" al Inspector (`src/components/builder/Inspector.tsx`)
- En el PropsTab, para **cualquier nodo** que tenga `position: absolute` o `fixed`, mostrar automáticamente controles visuales de posición (top, left, right, bottom) con NumericStyleField
- Agregar un preset de "ancla" (esquina superior izquierda, superior derecha, centro, etc.) como selector rápido
- Esto aplica a Badge, Text, Image, o cualquier nodo — no es exclusivo de ProductCard

#### 3. Actualizar `BuilderEditorShell.tsx`
- Ajustar la lógica de toggle `showBadge` para buscar el badge dentro del nuevo contenedor de imagen (ya no es hijo directo del root)

#### 4. Responsive
- Los valores por defecto de top/left/right/bottom usan `%` en lugar de `rem`/`px` fijo
- El sistema de responsive overrides existente (`style.responsive.sm/md/lg`) ya permite sobrescribir posición por breakpoint en la pestaña de estilos

### Archivos a modificar
- `src/lib/default-schemas.ts` — reestructurar el árbol del ProductCard
- `src/components/builder/Inspector.tsx` — agregar controles de posición rápida para nodos con position absolute/fixed
- `src/components/builder/BuilderEditorShell.tsx` — ajustar búsqueda del badge en el toggle
- `src/pages/Builder.tsx` — actualizar `createProductCardSchema` si referencia IDs específicos

