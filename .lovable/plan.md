

## Plan: Product Card Template como diseño maestro con data binding

### Problema actual
La Product Card se edita como template en `__template/product-card`, pero no hay un mecanismo para que el proyecto consumidor (Template) tome ese diseño y lo aplique automáticamente a todos los productos, inyectando datos reales (nombre, precio, imagen, descuento) desde la tabla `products`.

### Arquitectura propuesta

El Builder ya guarda el schema del Product Card en `page_schemas` con `slug: '__template/product-card'`. Lo que falta es:

1. **Una función utilitaria que clone el template y lo hidrate con datos de producto**
2. **Un componente `ProductGrid` que cargue el template + productos y renderice N cards**
3. **Marcar el botón "Add to Cart" como no-editable (locked) y emitir un evento/callback**

```text
┌─────────────────────────────────────────────────┐
│  page_schemas (DB)                              │
│  slug: '__template/product-card'                │
│  schema_json: { nodes: {...}, rootNodeId: ... } │
└────────────────────┬────────────────────────────┘
                     │ fetch template
                     ▼
┌──────────────────────────────┐
│  hydrateCardTemplate(        │
│    templateNodes,            │
│    product: { name, price,   │
│      image, badge, ... }     │
│  ) → cloned nodes with      │
│    real product data         │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  ProductGrid node            │
│  - Fetches template once     │
│  - Fetches products from DB  │
│  - Renders N hydrated cards  │
│  - "Add to Cart" → callback  │
└──────────────────────────────┘
```

### Cambios específicos

#### 1. Función `hydrateCardTemplate` — `src/lib/card-template-utils.ts` (nuevo)
- Recibe el schema del template (`nodes` + `rootNodeId`) y un objeto producto
- Clona los nodos, genera IDs únicos por producto
- Busca nodos por tipo para inyectar datos:
  - `Image` → `src` = `product.image_url`
  - `Text` con `level: 'h3'` → `text` = `product.name`
  - `Text` con `fontWeight: '600'` (precio) → `text` = formateado `$product.price`
  - `Text` con `textDecoration: 'line-through'` → `text` = `$product.original_price` (o hidden si no hay)
  - `Badge` → `text` = `product.badge` (o hidden si no hay)
  - `Button` → locked, texto fijo "Add to Cart"
- Retorna nodos clonados listos para merge en un schema

#### 2. Componente `ProductGridNode` — `src/components/schema/nodes/CommerceNodes.tsx`
- Nuevo node type `ProductGrid` registrado en block registry
- En modo `public`/`preview`: fetch del template desde DB + fetch de productos, renderiza grid de cards hidratadas
- Props configurables: `columns` (2-4), `limit`, `category` (filtro)
- El botón "Add to Cart" emite un `CustomEvent('nexora:addToCart', { productId })` que el proyecto Template escucha

#### 3. Bloquear botón "Add to Cart" en el template editor
- En `createProductCardComposite` y `productCardNodes`, marcar el nodo Button con `locked: true`
- En `Inspector.tsx`, cuando `node.locked === true` mostrar aviso "Este elemento no es editable" y deshabilitar campos
- El texto del botón puede cambiarse pero la acción es fija

#### 4. Registrar `ProductGrid` en el block registry — `src/lib/block-registry.ts`
- Nuevo bloque en categoría "Comercio"
- `inspectorFields`: columns (select 2/3/4), limit (number), category (text filter)
- `canHaveChildren: false`

#### 5. Actualizar `NodeRegistry` — `src/components/schema/NodeRegistry.tsx`
- Registrar `ProductGridNode` como renderer para type `ProductGrid`

#### 6. Actualizar tipos — `src/types/schema.ts`
- Agregar `'ProductGrid'` a `BuiltInNodeType`
- Agregar `onAddToCart` como prop opcional en `NodeProps`

### Archivos afectados
- **Nuevo**: `src/lib/card-template-utils.ts`
- **Modificados**: `src/components/schema/nodes/CommerceNodes.tsx`, `src/lib/block-registry.ts`, `src/components/schema/NodeRegistry.tsx`, `src/types/schema.ts`, `src/lib/default-schemas.ts`, `src/components/builder/Inspector.tsx`

### Flujo del administrador
1. Diseña la card en `__template/product-card` (cambia colores, tipografía, layout, etc.)
2. Guarda → se persiste en `page_schemas`
3. Agrega un bloque `ProductGrid` en la página Home o Products
4. El grid carga automáticamente el template guardado + los productos de la DB
5. Cada card muestra los datos reales del producto con el diseño personalizado
6. El botón "Add to Cart" dispara un evento que el proyecto Template captura

