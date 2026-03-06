

## Plan: Mejoras visuales y de UX para el constructor v1.0.6

### Archivos a modificar

**1. `SortableNodeWrapper.tsx` -- Seleccion y arrastre elegante**
- Reemplazar outline crudo por un borde suave con `box-shadow` tipo glow azul sutil
- En drag: escalar ligeramente (1.02), agregar sombra elevada, reducir opacity a 0.6
- Label del tipo de nodo: agregar backdrop-blur, bordes redondeados, sombra sutil, transicion de aparicion con opacity
- Hover state: mostrar un borde punteado sutil antes de seleccionar
- Transiciones suaves en todos los estados (150-200ms)

**2. `EditableDropZone.tsx` -- Drop zone animada**
- Reemplazar outline dashed por un borde con gradiente animado o pulso suave
- Agregar animacion de "breathing" en el placeholder vacio (scale pulse sutil)
- El icono `+` rota levemente al hacer hover
- Transicion de fondo mas suave con gradiente radial desde el centro
- Texto cambia a "Release to drop" cuando `isOver`

**3. `BuilderCanvas.tsx` -- Canvas con mejor feedback**
- Agregar patron de puntos sutil (dot grid) al fondo del canvas area
- Transicion suave del ancho del canvas al cambiar device con `transition: width 300ms`
- Shadow mas pronunciada y elegante en el contenedor del canvas

**4. `BuilderEditorShell.tsx` -- DragOverlay mejorado**
- El overlay del drag muestra icono del bloque + nombre
- Agregar sombra elevada, backdrop-blur, borde con color primary sutil
- Escala ligeramente mayor (1.05) para indicar que esta "flotando"

**5. `BlocksPalette.tsx` -- Bloques con hover mas rico**
- Hover: elevar con shadow + scale sutil (1.02)
- Agregar borde izquierdo de color al hacer hover
- Transicion de drag: el bloque original hace fade out suave
- Icono cambia de color en hover (muted -> primary)

**6. `LayersPanel.tsx` -- Layers con mejor interaccion**
- Hover: fondo con transicion mas suave, borde izquierdo sutil
- Selected: barra lateral de color primary (como PageManager)
- Indent lines: lineas verticales sutiles de conexion entre niveles
- Chevron animado al expandir/colapsar (rotacion suave)

**7. `Inspector.tsx` -- Inspector mas pulido**
- Header con gradiente sutil de fondo
- Inputs con focus ring animado
- Boton delete con confirmacion visual (hover rojo gradual)
- Separadores entre secciones de style

**8. `TopBar.tsx` -- Tooltips y micro-interacciones**
- Botones con transiciones de scale al hacer click (active:scale-95)
- Indicador "dirty" animado (punto pulsante al lado de Save)

**9. `index.css` -- Animaciones CSS globales**
- Agregar keyframes: `pulse-glow`, `breathe`, `slide-in-label`
- Clases utilitarias para el builder

**10. `package.json` -- Bump a 1.0.6** (ya esta en 1.0.6)

### Filosofia de los efectos
- Todos los efectos son sutiles (opacity, scale, shadow) -- nunca distractivos
- Duraciones entre 150-300ms con ease-out
- Colores: usar `--primary` con opacity baja para glows y highlights
- El feedback visual debe comunicar estado: hoverable, seleccionado, arrastrando, zona de drop activa

