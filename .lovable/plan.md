

# Plan: Corregir arrastre de secciones (drag & drop)

## Problema

El handler `handleDragEnd` para nodos `sortable` (línea 228-244 de `BuilderEditorShell.tsx`) solo soporta reordenamiento entre hermanos del mismo padre. Si el nodo destino (`overId`) no está en el mismo `parent.children` que el nodo arrastrado, `indexOf(overId)` retorna `-1` y el movimiento se ignora silenciosamente.

Esto rompe:
1. Reordenar secciones hijas directas del root cuando se suelta sobre un hijo interno de otra sección
2. Mover nodos entre contenedores diferentes (cross-parent)

## Solución

Reescribir el bloque `sortable` en `handleDragEnd` (líneas 228-244) para soportar tres escenarios:

### 1. Same-parent reorder (actual, funciona)
Si `activeId` y `overId` comparten padre → `arrayMove` como ahora.

### 2. Cross-parent move
Si tienen padres distintos:
- Validar con `canDropInto` que el nodo puede entrar al nuevo padre
- Remover `activeId` del padre original
- Insertar `activeId` en el nuevo padre junto al `overId`

### 3. Drop sobre contenedor vacío
Si `overId` corresponde a un nodo contenedor (droppable zone) y no es hermano:
- Validar con `canDropInto`
- Remover del padre original
- Añadir al final de `children` del contenedor destino

## Cambios

### `src/components/builder/BuilderEditorShell.tsx` (líneas 228-244)

Reemplazar el bloque sortable por:

```typescript
if (activeData?.type === 'sortable') {
  const activeId = String(active.id);
  const overId = String(over.id);
  if (activeId === overId) return;

  updateSchema((s) => {
    const findParent = (id: string) =>
      Object.values(s.nodes).find((n) => n.children.includes(id));

    const activeParent = findParent(activeId);
    if (!activeParent) return s;

    const overParent = findParent(overId);

    // Case 1: Same parent — simple reorder
    if (overParent && activeParent.id === overParent.id) {
      const oldIdx = activeParent.children.indexOf(activeId);
      const newIdx = activeParent.children.indexOf(overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        activeParent.children = arrayMove(activeParent.children, oldIdx, newIdx);
      }
      return s;
    }

    // Case 2: overId is a container node (drop zone) — move into it
    const overNode = s.nodes[overId];
    if (overNode) {
      const activeNode = s.nodes[activeId];
      if (activeNode && canDropInto(activeNode.type, overNode.type, overId === s.rootNodeId)) {
        // Remove from old parent
        const idx = activeParent.children.indexOf(activeId);
        if (idx !== -1) activeParent.children.splice(idx, 1);
        // Add to new parent
        overNode.children.push(activeId);
        return s;
      }
    }

    // Case 3: Cross-parent — move next to overId in its parent
    if (overParent) {
      const activeNode = s.nodes[activeId];
      if (activeNode && canDropInto(activeNode.type, overParent.type as any, overParent.id === s.rootNodeId)) {
        const oldIdx = activeParent.children.indexOf(activeId);
        if (oldIdx !== -1) activeParent.children.splice(oldIdx, 1);
        const newIdx = overParent.children.indexOf(overId);
        overParent.children.splice(newIdx + 1, 0, activeId);
        return s;
      }
    }

    return s;
  });
}
```

Esto es un cambio único en un solo archivo (~30 líneas reemplazadas).

