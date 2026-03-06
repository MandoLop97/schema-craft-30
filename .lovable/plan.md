

## Publicar v1.0.7 a npm

El código ya está listo con todas las funcionalidades de v1.0.7:
- Theme Editor visual
- Drag reorder en layers (dnd-kit sortable)
- Undo/Redo completo (useSchemaHistory + shortcuts)
- Nuevos bloques: Accordion, TabsBlock, VideoEmbed

**package.json** ya marca `"version": "1.0.7"` y el `index.ts` exporta todos los componentes necesarios.

### Lo que necesitas hacer (fuera de Lovable)

Lovable no puede ejecutar comandos CLI como `npm publish`. Necesitas hacerlo desde tu máquina local:

1. **Sincronizar el código** — Haz pull desde GitHub (si tienes el repo conectado) o descarga el código desde Lovable
2. **Instalar dependencias** — `npm install` o `bun install`
3. **Build de la librería**:
   ```bash
   npm run build:lib
   ```
   Esto ejecuta `vite build --config vite.config.lib.ts` + genera tipos con `tsc`
4. **Verificar el output** — Confirma que `dist/` contiene `index.js`, `index.d.ts` y `style.css`
5. **Publicar**:
   ```bash
   npm publish --access public
   ```
6. **Actualizar el template** — En tu proyecto template:
   ```bash
   npm install @mandolop97/constructor-nexora@1.0.7
   ```

### Checklist pre-publicación

- [ ] `ThemeEditor` se exporta indirectamente via `NexoraBuilderApp` (ya incluido en `BuilderEditorShell`)
- [ ] Los tipos `Accordion | TabsBlock | VideoEmbed` están en `NodeType` union
- [ ] `InteractiveNodes` están registrados en `NodeRegistry` y `block-registry`
- [ ] `LayersPanel` tiene sortable integrado con `onReorderChildren`

Todo está listo en el código. Solo falta el build y publish desde tu terminal.

