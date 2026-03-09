

# Plan: Documentación pública del paquete NPM

## Objetivo
Incluir un archivo `NEXORA.md` en la raíz del paquete publicado para que cualquier desarrollador o IA que trabaje en un proyecto donde esté instalado `@mandolop97/constructor-nexora` pueda leer la documentación completa del constructor desde `node_modules`.

## Cambios

### 1. Crear `NEXORA.md` en la raíz del proyecto
Documentación pública completa en inglés, basada en `.lovable/nexora-docs.md` y actualizada al contrato v1.7.0. Incluirá:

- Arquitectura (schema-first, render modes, data flow)
- Tipos principales (Schema, SchemaNode, NodeType, NodeStyle, ThemeTokens, RenderContext, PageContext, SlotAssignment)
- API del componente principal (`NexoraBuilderApp` props)
- Sistema de bloques y extensibilidad (customComponents, extraBlocks)
- hostData y RenderContext (cómo el host provee datos)
- Slot system (locked/editable/dynamic)
- Publish pipeline y validación
- Todos los exports del paquete con descripción
- Ejemplos de integración

### 2. Actualizar `package.json` → campo `"files"`
Cambiar `"files": ["dist"]` a `"files": ["dist", "NEXORA.md"]` para que el archivo se incluya en el paquete publicado.

### 3. Agregar JSDoc a los exports principales en `src/index.ts`
Comentarios breves en cada grupo de exports para que IDEs muestren documentación inline al hacer hover.

## Resultado
Cualquier proyecto que instale el paquete tendrá acceso a `node_modules/@mandolop97/constructor-nexora/NEXORA.md` con toda la referencia técnica del constructor.

