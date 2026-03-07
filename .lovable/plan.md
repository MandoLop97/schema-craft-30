

## Plan: Navbar 100% Responsivo con Menú Hamburguesa Configurable

### Objetivo
Hacer que el `NavbarNode` sea completamente responsivo: en modo móvil, los links se ocultan y aparece un botón hamburguesa. El usuario podrá configurar desde el Inspector si el menú móvil se abre como **sidebar** (desliza desde un lado) o como **dropdown** (se despliega hacia abajo).

### Cambios

**1. `src/components/schema/nodes/SiteNodes.tsx` — NavbarNode responsivo**
- Agregar estado local `menuOpen` para controlar apertura/cierre del menú móvil
- Usar CSS Container Queries (`@container`) para detectar ancho móvil (< 768px) dentro del canvas del builder
- En móvil: ocultar los links desktop, mostrar botón hamburguesa (☰ / ✕)
- Leer prop `mobileMenuStyle` (`'sidebar'` | `'dropdown'`) para renderizar:
  - **sidebar**: panel fijo que desliza desde la izquierda/derecha con overlay oscuro
  - **dropdown**: panel que se expande debajo del navbar con animación vertical
- Los links dentro del menú móvil se muestran en columna vertical

**2. `src/components/builder/Inspector.tsx` — NavbarPropsEditor**
- Agregar un nuevo campo `Select` en la sección del Navbar:
  - Label: "Menú Móvil"
  - Opciones: `sidebar` (Lateral) | `dropdown` (Desplegable)
- El valor se guarda como `mobileMenuStyle` en las props del nodo

**3. `src/types/schema.ts`** — Sin cambios necesarios (NodeProps ya es `Record<string, any>`)

### Comportamiento visual
- **Desktop**: links en fila horizontal (sin cambios)
- **Móvil (container < 768px)**: hamburguesa visible, links ocultos
  - Click hamburguesa → abre menú según configuración
  - Click en link o fuera → cierra menú

### Notas técnicas
- Se usa Container Queries (ya implementado en el proyecto) para que funcione correctamente en el simulador de dispositivos del builder
- El estado `menuOpen` es local al componente (no persiste en schema)
- Animaciones CSS con transitions para sidebar (translateX) y dropdown (max-height)

