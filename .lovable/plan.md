

## Plan: Corregir el diseño heredado del ProductGrid para que respete el template

### Problema
El template de Product Card se diseña a pantalla completa en el editor (image-72), pero cuando se renderiza dentro del ProductGrid (image-71), los estilos no se adaptan correctamente: las cards no tienen gap entre sí, la imagen no mantiene proporción, y el layout general se rompe porque los nodos clonados conservan estilos absolutos del template (ej. `width: 100%` del editor) sin adaptarse al contexto de celda del grid.

### Causa raíz
1. **Sin gap en el grid** — el `gridTemplateColumns` se aplica pero no hay `gap` definido
2. **Nodo raíz del template hereda estilos de editor** — el `ProductCard` root puede tener `width` o `maxWidth` fijos del editor single-card que no aplican en grid
3. **`hydrateCardTemplate` no normaliza estilos del root** — clona todo literalmente, incluyendo dimensiones que solo tenían sentido en el editor de template aislado

### Cambios propuestos

#### 1. `src/components/schema/nodes/CommerceNodes.tsx` — ProductGridNode
- Agregar `gap: '1.5rem'` al grid container (edit, preview y public)
- En el wrapper de cada card, forzar `width: '100%'`, `minWidth: 0` y `overflow: 'hidden'` para que cada card respete su celda del grid
- Usar `auto-fill` con `minmax` en vez de `repeat(N, 1fr)` fijo para responsividad automática: `gridTemplateColumns: repeat(auto-fill, minmax(250px, 1fr))`

#### 2. `src/lib/card-template-utils.ts` — hydrateCardTemplate
- Al clonar el nodo raíz (rootNodeId), normalizar sus estilos para contexto de grid:
  - Eliminar `width`, `maxWidth`, `minWidth` fijos del root (el grid cell controla el ancho)
  - Forzar `width: '100%'` y `height: 'auto'` en el root clonado
  - Asegurar que `overflow: 'hidden'` esté presente para contener la imagen
- En nodos `Image`, asegurar `width: '100%'`, `height: 'auto'`, `objectFit: 'cover'`

#### 3. Gap configurable desde Inspector
- En `src/lib/block-registry.ts`, agregar campo `gap` al bloque ProductGrid (select: `1rem`, `1.5rem`, `2rem`)
- En el render, leer `node.props.gap` y aplicarlo al grid container

### Archivos afectados
- `src/components/schema/nodes/CommerceNodes.tsx` — grid styles + card wrapper normalization
- `src/lib/card-template-utils.ts` — normalize root node styles for grid context
- `src/lib/block-registry.ts` — add gap inspector field

