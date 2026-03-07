

## Investigación: Features faltantes vs Elementor Pro

Después de revisar el código completo del builder, aquí está el análisis de lo que **ya tienes** vs lo que **le falta** para acercarse a Elementor Pro.

### Lo que YA tienes (bien cubierto)
- Drag & drop con nested containers (Elementor-style)
- Block palette con categorías (Layout, Content, UI, Interactive, Commerce, Site, Template)
- Inspector con tabs (Props / Style)
- Theme Editor (colores, tipografía, radius, spacing, gradientes)
- Undo/Redo con historial
- Device toggle (Desktop/Tablet/Mobile)
- Layers panel (árbol de nodos)
- Pseudo-states (hover/focus/active) en estilos
- Responsive overrides por breakpoint (sm/md/lg/xl)
- Animaciones predefinidas (fadeIn, slideUp, bounceIn, etc.)
- Export/Import JSON schema
- Publish dialog
- Navbar responsivo con hamburguesa configurable (sidebar/dropdown)
- Extensibilidad (custom components, extra blocks, inspector fields)

### Lo que FALTA (ordenado por impacto)

**1. Copy/Paste de bloques (Ctrl+C / Ctrl+V)**
- Elementor permite copiar cualquier widget/sección y pegarlo en otro lugar
- Tu builder tiene "Duplicate" pero no copy/paste entre secciones o páginas

**2. Right-click Context Menu**
- Elementor tiene menú contextual al hacer click derecho: Copy, Paste, Duplicate, Delete, Save as Template, Edit, Reset Style
- Actualmente solo hay botones en el Inspector y en el SortableNodeWrapper

**3. Global Styles / Clases reutilizables**
- Elementor permite guardar "Global Colors" y "Global Fonts" que se aplican a múltiples widgets
- Tu Theme Editor aplica tokens globales pero no hay "clases" reutilizables por bloque

**4. Spacer / Divider widget mejorado**
- Elementor tiene un widget Spacer dedicado (solo espacio vertical configurable)
- Tu Divider es una línea HR; falta un bloque de espacio puro

**5. Icon widget**
- Elementor tiene un widget de iconos con librería integrada (Font Awesome, etc.)
- Tu builder no tiene un bloque dedicado para iconos

**6. Social Icons widget**
- Widget dedicado para íconos de redes sociales con estilos predefinidos
- Útil especialmente en el Footer

**7. Icon List (lista con iconos)**
- Lista de items con icono + texto, muy usado en features y beneficios

**8. Star Rating widget**
- Widget dedicado para calificaciones con estrellas
- Tu TestimonialCard tiene `stars` pero no hay un widget independiente

**9. Progress Bar / Counter**
- Widgets de progreso y contadores animados
- Comunes en landing pages

**10. Google Maps embed**
- Widget para embeber mapas
- Común en páginas de contacto

**11. Form widget avanzado**
- Elementor Pro tiene formularios multi-campo (nombre, email, teléfono, textarea, select)
- Tu Input es solo un campo individual

**12. Saved Templates / Sections**
- Elementor permite guardar secciones como templates reutilizables
- Tu builder tiene PageDefinitions pero no "saved sections" individuales

**13. Motion Effects (Parallax, Scrolling)**
- Parallax en backgrounds, scroll-triggered animations
- Tienes animaciones CSS pero no parallax ni scroll-based triggers

**14. Custom CSS per widget**
- Elementor Pro permite escribir CSS personalizado por widget
- Tu Inspector tiene campos de estilo pero no un campo de CSS raw

**15. Sticky positioning**
- Elementor permite fijar secciones como sticky al scroll
- Tu NodeStyle tiene `position` pero no hay UI dedicada para sticky

---

### Recomendación de prioridad para implementar

Si quieres el mayor impacto con menor esfuerzo, sugiero este orden:

| Prioridad | Feature | Esfuerzo |
|-----------|---------|----------|
| 1 | Right-click Context Menu (Copy, Paste, Delete, Duplicate) | Medio |
| 2 | Spacer widget | Bajo |
| 3 | Icon widget con librería Lucide | Medio |
| 4 | Social Icons widget | Bajo |
| 5 | Custom CSS field per widget | Bajo |
| 6 | Saved Sections/Templates | Alto |
| 7 | Form widget multi-campo | Medio |
| 8 | Motion Effects (parallax básico) | Alto |

Las primeras 5 se podrían implementar relativamente rápido y darían una experiencia mucho más cercana a Elementor Pro.

