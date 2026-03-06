

## Plan: Arreglar el PageManager en sidebar + documentar integración con páginas reales

### Problema 1: PageManager se ve mal en el sidebar
El `PageManager` actual tiene `p-8 max-w-2xl mx-auto` — diseñado para pantalla completa, no para un panel lateral de 240px. Los botones con iconos de 36px, badges de status y chevrons desbordan el espacio.

### Problema 2: El template debe usar páginas reales
El constructor ya exporta `PAGE_DEFINITIONS` y `getDefaultSchemaForSlug()` con 8 páginas predefinidas. El template debe usar estas definiciones (o sus propias rutas reales) como fuente de verdad, no consultar la base de datos para saber qué páginas existen.

### Cambios

**1. Rediseñar `PageManager` para funcionar en sidebar (240px)**
- Quitar `p-8 max-w-2xl mx-auto` — usar `p-3` compacto
- Reducir header: quitar icono grande, usar texto más pequeño
- Simplificar botones de página: eliminar el icono de 36px, reducir padding, hacer badges más compactos
- Quitar el `ChevronRight` para ahorrar espacio
- Mantener: nombre de página, slug, indicador de activo, badge de status

**2. Actualizar `README.md` con prompt/guía para el template**
- Agregar sección clara explicando que el template debe usar `PAGE_DEFINITIONS` exportado por el paquete (o sus rutas reales)
- Incluir un bloque de código listo para copiar que el usuario pueda usar como prompt en el proyecto template
- Enfatizar: las páginas NO se traen de base de datos, se definen en código

**3. Bump versión a `1.0.5`**

### Resultado esperado del PageManager en sidebar

```text
┌──────────────────────┐
│ Pages                │
│ Select a page        │
├──────────────────────┤
│ ● Inicio         Live│
│   /                  │
├──────────────────────┤
│   Tienda        Draft│
│   /products          │
├──────────────────────┤
│   Contacto      Draft│
│   /contact           │
└──────────────────────┘
```

### Ejemplo de prompt para el template

Se incluirá en el README un bloque que el usuario puede copiar y pegar directamente en el proyecto template, indicando cómo importar `PAGE_DEFINITIONS` y `getDefaultSchemaForSlug` del paquete y construir el array de `pages` a partir de las rutas reales, usando la BD solo para persistencia de schemas editados.

