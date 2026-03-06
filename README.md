# @mandolop97/constructor-nexora

Editor visual de páginas basado en esquemas JSON para aplicaciones React.

## Instalación

```bash
npm install @mandolop97/constructor-nexora
```

## Uso rápido

```tsx
import { NexoraBuilderApp } from '@mandolop97/constructor-nexora';
import '@mandolop97/constructor-nexora/styles.css';

<NexoraBuilderApp
  initialSchema={mySchema}
  onSave={(schema) => saveToDatabase(schema)}
  onPublish={(schema) => publishSchema(schema)}
/>
```

## Integración multi-página

> **Importante:** Las páginas que aparecen en el editor son las **rutas reales de tu aplicación**. La base de datos solo almacena el contenido (schema) de cada página, **no define qué páginas existen**.

El array `pages` debe construirse a partir de las rutas reales definidas en tu template (React Router, etc.), no de registros de base de datos.

```tsx
import {
  NexoraBuilderApp,
  getDefaultSchemaForSlug,
} from '@mandolop97/constructor-nexora';
import '@mandolop97/constructor-nexora/styles.css';

// 1. Define tus páginas REALES (las rutas de tu app)
const REAL_PAGES = [
  { slug: '/', title: 'Inicio' },
  { slug: '/products', title: 'Tienda' },
  { slug: '/faq', title: 'Preguntas frecuentes' },
  { slug: '/contact', title: 'Contacto' },
];

function BuilderPage() {
  const [currentSlug, setCurrentSlug] = useState('/');
  const [savedSchemas, setSavedSchemas] = useState<Record<string, Schema>>({});

  // 2. Para cada página real, busca su schema en BD o usa el default
  const pages = REAL_PAGES.map((page) => ({
    ...page,
    schema: savedSchemas[page.slug] ?? getDefaultSchemaForSlug(page.slug),
    status: savedSchemas[page.slug] ? 'published' as const : 'draft' as const,
  }));

  // 3. Pasa las páginas reales al builder
  return (
    <NexoraBuilderApp
      pages={pages}
      activePage={currentSlug}
      onPageChange={setCurrentSlug}
      onSave={(schema) => saveToDatabase(currentSlug, schema)}
      onSaveWithSlug={(slug, schema) => saveToDatabase(slug, schema)}
      onPublish={(schema) => publishSchema(currentSlug, schema)}
    />
  );
}
```

## Props API

| Prop | Tipo | Descripción |
|------|------|-------------|
| `initialSchema` | `Schema` | Schema inicial. Tiene prioridad sobre `pages`. |
| `pages` | `PageDefinition[]` | Lista de páginas reales disponibles para editar. |
| `activePage` | `string` | Slug de la página activa (debe existir en `pages`). |
| `onPageChange` | `(slug: string) => void` | Callback al cambiar de página. |
| `onSave` | `(schema: Schema) => void` | Callback al guardar. |
| `onSaveWithSlug` | `(slug: string, schema: Schema) => void` | Callback al guardar con el slug de la página activa. |
| `onPublish` | `(schema: Schema) => void` | Callback al publicar. Si se omite, se muestra un diálogo interno. |
| `onPreview` | `(schema: Schema) => void` | Callback al previsualizar. |
| `onExport` | `(schema: Schema) => void` | Callback al exportar. |
| `domain` | `string` | Contexto de dominio para multi-tenant. |
| `className` | `string` | Clase CSS para el contenedor raíz. |

## Exports adicionales

```tsx
// Renderer independiente (para renderizar schemas sin el editor)
import { PageRenderer } from '@mandolop97/constructor-nexora';

// Utilidades de schema
import {
  createDefaultHomeSchema,
  getDefaultSchemaForSlug,
  validateSchema,
  createNode,
  blockRegistry,
} from '@mandolop97/constructor-nexora';
```

## Tecnologías

React · TypeScript · Tailwind CSS · Vite · shadcn/ui
