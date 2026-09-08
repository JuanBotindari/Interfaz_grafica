# Santander AI Graph Architecture Workbench

Plataforma interactiva para el diseño, simulación, gestión y visualización de arquitecturas basadas en grafos de agentes e Inteligencia Artificial.

---

## 🚀 Estado Actual del Proyecto y Funcionalidades

### 🎨 1. Sistema de Temas (Neon Mode & Santander Mode)
- **Neon Mode**: Interfaz en modo oscuro con acentos de neón (`#00f0ff`, `#a855f7`) pensada para entornos futuristas/cyberpunk.
- **Santander Mode**: Interfaz corporativa limpia sobre fondo blanco/gris claro (`#F5F6F8`), acentos en **Rojo Santander** (`#EC0000`) y escala de grises para líneas de control y tarjetas.
- **Conmutador Reactivo**: Cambio de tema en tiempo real desde la barra de herramientas principal (`CanvasControls`), reflejado al instante en canvas, conexiones, minimapa y componentes.

### 📐 2. Lienzo Interactivo y Edición Avanzada
- **Nodos y Jerarquías**: Soporte para nodos de tipo `HUB`, `AGENT`, `TOOL`, `WORKER` y contenedores `GROUP`.
- **Navegación Canvas**: Pan (arrastrar fondo), Zoom responsivo, Ajuste magnético a cuadrícula (*Snap to Grid*) y Guías de alineación magnética inter-nodo.
- **Minimapa Interactivo**: Vista previa global del diagrama con cuadro de navegación sincronizado y soporte multi-tema.
- **Auto-Layout**: Algoritmo de ordenamiento jerárquico por niveles para organizar automáticamente grafos desordenados con un solo clic.

### 🔄 3. Flujo de Datos, Simulación e Historial
- **Tipos de Conexión**: Diferenciación visual entre flujo de **Datos** (flechas animadas rojas/azules) y de **Control** (gris/púrpura).
- **Modo Simulación**: Animación *dash* sobre los cables para visualizar el tráfico de información activo entre agentes.
- **Historial Completo (Undo / Redo)**: Pila de estados ilimitada con atajos de teclado (`Ctrl+Z` / `Ctrl+Y`) para revertir cualquier movimiento, conexión o eliminación.

### 💾 4. Persistencia e Importación/Exportación JSON
- **Guardado Automático**: Integración con `localStorage` para evitar pérdida de datos al recargar.
- **Exportación JSON**: Descarga de la arquitectura completa incluyendo nodos, posiciones, conexiones y la propiedad activa del tema (`theme: "santander" | "neon"`).
- **Importación JSON**: Carga de archivos JSON externos con validación de estructura y rehidratación automática del tema y el canvas.

---

## 🛠️ Tecnologías Principales

- **Framework**: Next.js / React (TypeScript)
- **Gestión de Estado**: Zustand (Store atómico y sincronizado)
- **Iconografía**: Lucide React
- **Estilos**: Inline Styles dinámicos y Tailwind CSS

