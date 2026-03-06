

## Plan: Documentar en README que el template debe usar sus páginas reales

El usuario quiere que el README del paquete indique claramente al template (host) que debe pasar como `pages` las páginas reales que existen en su proyecto de rutas, **no** las que estén guardadas en la base de datos. Las páginas reales del template son la fuente de verdad; la base de datos solo almacena el schema/contenido de cada una.

### Cambios

**1. Reescribir `README.md`** con documentación orientada al paquete npm `@mandolop97/constructor-nexora`:

- Sección de instalación (`npm install @mandolop97/constructor-nexora`)
- Sección de uso con ejemplo de integración, enfatizando que el array `pages` debe construirse a partir de las **rutas reales del template** (e.g. las rutas definidas en React Router), no de registros de base de datos
- Ejemplo de código mostrando cómo el template detecta sus rutas reales, y para cada una busca si existe un schema guardado en BD; si no existe, usa `getDefaultSchemaForSlug()` como fallback
- Documentar la prop API: `initialSchema`, `pages`, `activePage`, `onSave`, `onPublish`, `onPageChange`, etc.
- Nota clara: "Las páginas que aparecen en el editor son las rutas reales de tu aplicación. La base de datos solo almacena el contenido (schema) de cada página, no define qué páginas existen."

**2. Bump versión a `1.0.3`** en `package.json`

### Ejemplo clave del README

```tsx
// 1. Define tus páginas REALES (las rutas de tu app)
const REAL_PAGES = [
  { slug: '/', title: 'Inicio' },
  { slug: '/products', title: 'Tienda' },
  { slug: '/contact', title: 'Contacto' },
];

// 2. Para cada página real, busca su schema en BD o usa el default
const pages = REAL_PAGES.map(page => ({
  ...page,
  schema: savedSchemas[page.slug] ?? getDefaultSchemaForSlug(page.slug),
  status: savedSchemas[page.slug] ? 'published' : 'draft',
}));

// 3. Pasa las páginas reales al builder
<NexoraBuilderApp pages={pages} activePage={currentSlug} ... />
```

