

## Plan: Heredar colores y estilos del template en el ProductGrid

### Problema
El `ProductGridNode` carga el template `__template/product-card` desde la base de datos pero **descarta los `themeTokens`** del template. Los nodos del template usan colores como `hsl(var(--primary))`, que dependen de CSS custom properties. Actualmente esas variables se resuelven con el tema de la **página Home** (que puede tener colores distintos), en lugar del tema con el que se diseñó la card.

Además, el CSS dinámico del template (pseudo-estados hover/focus, custom CSS, responsive overrides) nunca se genera para los nodos hidratados.

### Cambios

#### 1. `src/components/schema/nodes/CommerceNodes.tsx`
- **Guardar `themeTokens` del template**: Al parsear `templateRow.schema_json`, también extraer `schema.themeTokens` y almacenarlo en el estado.
- **Inyectar CSS variables del template**: Envolver cada card (o el grid completo) en un `div` con las CSS custom properties del template (`--primary`, `--background`, `--border`, etc.) usando la misma lógica que `PageRenderer.themeStyle`. Esto crea un "scope" de tema local que sobrescribe las variables del padre.
- **Generar dynamicCSS para nodos hidratados**: Para cada nodo hidratado, llamar a `generatePseudoStateCSS` y `generateResponsiveCSS` e inyectar un `<style>` tag dentro del grid.

#### 2. Extraer helper reutilizable
- Crear una función `themeTokensToCSS(tokens: ThemeTokens): React.CSSProperties` (extraída de la lógica existente en `PageRenderer`) para evitar duplicar el cálculo de CSS variables. Se puede colocar en `src/lib/style-utils.ts` o inline en `CommerceNodes.tsx`.

### Archivos afectados
- `src/components/schema/nodes/CommerceNodes.tsx` — almacenar themeTokens, inyectar scope de CSS variables, generar dynamicCSS
- `src/lib/style-utils.ts` (opcional) — extraer `themeTokensToCSS` como utilidad compartida

### Resultado esperado
Las cards en el ProductGrid se renderizan con exactamente los mismos colores, tipografía y efectos hover que se ven al editar el template `__template/product-card`.

