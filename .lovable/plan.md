

## Plan: Layout blocks al 100% + Responsividad completa

### Problemas detectados

1. **Grid no es responsivo**: Usa `gridTemplateColumns: repeat(N, 1fr)` fijo. En mobile, 4 columnas se comprimen sin adaptarse.
2. **Layout nodes no tienen estilos responsivos**: No hay sistema de breakpoints en el schema ni en los renderers.
3. **Section/Container carecen de props editables en el inspector**: No se puede configurar alignment, dirección, etc. desde el panel derecho.
4. **El canvas no simula responsividad real**: Cambia el ancho del wrapper pero los nodos internos no reaccionan con media queries porque están en inline styles.

### Solución

**1. Hacer Grid responsivo automáticamente** (`LayoutNodes.tsx`)

El `GridNode` usará CSS clamp/auto-fill en vez de columnas fijas cuando el viewport sea pequeño:
- En desktop: `repeat(N, 1fr)` como ahora
- Agregar `@container` o `auto-fill` con `minmax(min(100%, 280px), 1fr)` para que las columnas se adapten automáticamente al ancho disponible
- Esto se logra sin media queries, solo con CSS grid inteligente

**2. Agregar props de layout al inspector** (`Inspector.tsx`)

Para Section, Container, Grid, Stack — agregar campos editables:
- Section: `alignItems`, `justifyContent`, `backgroundColor`, `minHeight`
- Container: `maxWidth`  
- Grid: `columns`, `gap`
- Stack: `direction`, `gap`, `alignItems`

**3. Hacer que los layout nodes usen estilos responsivos** (`LayoutNodes.tsx`)

- Agregar `width: 100%`, `box-sizing: border-box` como base en todos los layout nodes
- Stack horizontal: hacer wrap automático con `flexWrap: wrap` para que en mobile los items se apilen
- Container: usar `width: 100%` + `maxWidth` + padding lateral para que respete bordes en mobile

**4. Mejorar el canvas para simular responsividad** (`BuilderCanvas.tsx`)

- Envolver el canvas en un `<iframe>` o usar CSS `container-type: inline-size` para que los nodos internos reaccionen al ancho del canvas, no al del viewport
- Alternativa más simple: pasar `device` al PageRenderer y ajustar estilos condicionalmente

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/components/schema/nodes/LayoutNodes.tsx` | Grid responsivo con auto-fill, Stack con flexWrap, Container con width:100% |
| `src/components/builder/Inspector.tsx` | Props editables para Section/Container/Grid/Stack |
| `src/components/builder/BuilderCanvas.tsx` | Pasar device context al renderer |
| `src/components/schema/PageRenderer.tsx` | Recibir device prop y pasarlo a nodos |

### Resultado esperado

- Arrastrar un Grid de 4 columnas dentro de una Section → se renderiza con 4 columnas en desktop y se adapta a 1-2 en mobile
- Cambiar a vista tablet/mobile en el top bar → el canvas refleja cómo se verá en esos dispositivos
- Section, Container, Grid, Stack son completamente editables desde el inspector

