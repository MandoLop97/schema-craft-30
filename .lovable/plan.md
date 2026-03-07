

## Plan: Refinar el diseño visual del PageManager

El PageManager actual es funcional pero visualmente plano comparado con el builder (que usa soft blue glows, backdrop-blur, micro-interactions, dot-grid backgrounds). Voy a alinear el estilo.

### Cambios en `src/components/builder/PageManager.tsx`

1. **Fondo con dot-grid** -- Reutilizar la clase `nxr-canvas-grid` del builder como fondo sutil de toda la vista
2. **Header con backdrop-blur y glow** -- Agregar `backdrop-blur-md`, sombra sutil tipo glow azul, y un gradiente tenue
3. **Tarjetas con glassmorphism** -- Añadir `backdrop-blur-sm`, bordes translúcidos, sombra suave por defecto, y hover con glow azul (`box-shadow` con `hsl(var(--primary))`)
4. **Thumbnails con overlay gradient** -- Un gradiente sutil de abajo hacia arriba sobre el thumbnail para mejor legibilidad del contenido inferior
5. **Category headers mejorados** -- Badge con count estilizado, línea separadora sutil debajo, icono con color primario en hover
6. **Micro-interactions consistentes** -- `active:scale-[0.98]` en tarjetas, transiciones de 200ms, hover scale `1.03`
7. **Badge de status mejorado** -- Pill con fondo semitransparente en lugar de solo texto

### Cambios en `src/index.css`

8. **Nueva animación `fade-in-up`** -- Para entrada suave de las tarjetas al expandir una categoría

### Sin cambios en la versión (ya es 1.0.9)

