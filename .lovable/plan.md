

## Plan: Asegurar que el builder npm sea un editor puro del schema host

### Diagnóstico

El código actual ya cumple la mayoría de los requisitos. `NexoraBuilderApp` prioriza `initialSchema` sobre el demo, usa `key={resolvedSchema.id}` para reinicializar, y expone la API pública correcta. Sin embargo hay puntos a reforzar:

1. **`createDefaultHomeSchema` se importa siempre** — aunque solo se usa como fallback, su presencia en el bundle de la librería agrega peso y confusión.
2. **La página standalone `Builder.tsx`** usa `SchemaStore` (localStorage) directamente, mezclando lógica demo con el editor base.
3. **No se exporta `createNode` ni `isContainerType`** — el host podría necesitarlos para manipular schemas programáticamente.
4. **No hay validación del schema entrante** — si el host pasa un schema malformado (sin `rootNodeId`, sin `nodes`), el builder crashea silenciosamente.

### Cambios propuestos

| Archivo | Cambio |
|---|---|
| `src/NexoraBuilderApp.tsx` | Lazy-import de `createDefaultHomeSchema` para que no se cargue si llega `initialSchema`. Agregar validación mínima del schema entrante (verificar `rootNodeId` existe en `nodes`). |
| `src/index.ts` | Exportar `createNode`, `isContainerType`, y `createDefaultHomeSchema` para que el host pueda usarlos si lo necesita. |
| `src/pages/Builder.tsx` | Refactorizar para que sea un wrapper demo que usa `NexoraBuilderApp` en vez de `BuilderEditorShell` directamente — así el standalone y el embebido usan exactamente el mismo componente. |
| `src/lib/schema-validator.ts` | Crear función `validateSchema(schema)` que verifica estructura mínima y retorna errores o el schema limpio. Usada en `NexoraBuilderApp` antes de pasar al shell. |

### Detalle técnico

**Validación de schema** (`schema-validator.ts`):
- Verificar que `rootNodeId` existe en `nodes`
- Verificar que cada `children` referencia nodos existentes
- Si falla, mostrar un mensaje de error en el canvas en vez de crashear

**Lazy fallback** en `NexoraBuilderApp`:
```ts
const resolvedSchema = useMemo<Schema>(() => {
  if (initialSchema) return initialSchema;
  // Solo importar el demo si no hay schema externo
  return createDefaultHomeSchema().schema;
}, [initialSchema]);
```
Esto ya es así, pero agregaremos un guard de validación antes de pasarlo al shell.

**Builder.tsx como wrapper demo**:
```tsx
export default function Builder() {
  // ... load from SchemaStore ...
  return <NexoraBuilderApp initialSchema={schema} onSave={...} />;
}
```
Esto asegura que standalone y embebido comparten exactamente el mismo flujo.

### Versión resultante: v1.1.0

Bump a minor por cambio de API pública (nuevas exports).

