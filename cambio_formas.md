Aplica esta paleta de estilos adaptada a la geometría de cada nodo para garantizar jerarquía visual y contraste impecable en ambos temas.

| Tipo de Nodo | Forma | Tema Santander (Blanco, Rojo, Gris) | Tema NEON (Dark, Cyberpunk, Glow) |
| --- | --- | --- | --- |
| **HUB** | Círculo con Anillo | Fondo blanco, borde doble rojo (`#EC0000`), sombra suave gris. | Fondo `#0A0F1D`, borde cyan (`#00F0FF`) con `box-shadow: 0 0 12px #00F0FF`. |
| **HUB2** | Octágono | Fondo gris claro (`#F4F4F6`), borde rojo, `clip-path` octagonal. | Fondo `#0A0F1D`, borde magenta (`#FF007F`) con glow magenta intenso. |
| **DEPARTMENT** | Carpeta / Contenedor | Fondo blanco, cabecera/pestaña roja con texto blanco, borde gris. | Fondo `#0B1120`/80, cabecera con línea neón cyan, borde resplandeciente. |
| **AREA** | Marco Punteado | Fondo gris neutro muy claro (`#FAFAFA`), `border: 2px dashed #EC0000`. | Fondo translúcido, `border: 2px dashed #00FF66` (Lime Neón). |
| **GROUP / PROCESS** | Tarjeta con Encabezado | Contenedor gris claro (`#E5E7EB`), barra superior gris oscuro/roja. | Contenedor `#0F172A`, barra superior cyan o púrpura neón. |
| **SUBPROCESS** | Rectángulo Borde Doble | Fondo blanco, `border: 4px double #EC0000`, esquinas `rounded-lg`. | Fondo `#0A0F1D`, `border: 4px double #00F0FF` con resplandor cyan. |
| **AGENT** | Hexágono (IA) | Fondo blanco, borde rojo, `clip-path` hexagonal. | Fondo `#1E1B4B`, borde verde neón (`#00FF66`) con glow `0 0 10px #00FF66`. |
| **TASK** | Rectángulo Redondeado | Tarjeta blanca, borde gris (`#D1D5DB`), acento rojo al hover. | Tarjeta `#0F172A`, borde cyan neón, texto brillante. |
| **DECISION** | Rombo (Diamond 45°) | Fondo rojo Santander (`#EC0000`) con texto/icono blanco. | Fondo `#0A0F1D`, borde amarillo/naranja neón (`#FFB800`) con glow. |
| **KNOWLEDGE_BASE** | Cilindro / BD | Fondo gris muy claro con degradado sutil, borde rojo o gris oscuro. | Degradado cyan a magenta neón con efecto de brillo metálico. |
| **ACTION** | Cápsula (Pill) | Botón rojo sólido (`#EC0000`) o cápsula blanca con borde rojo. | Cápsula magenta neón (`#FF007F`) con relleno brillante. |
| **RESOURCE** | Esquina Doblada | Tarjeta blanca, doblez superior en gris, borde gris oscuro. | Tarjeta `#0A0F1D`, doblez y bordes en verde neón (`#00FF66`). |
| **TOOL** | Rectángulo Biselado | Fondo gris (`#E5E7EB`), esquinas cortadas a 45°, borde rojo. | Fondo `#0F172A`, esquinas a 45°, borde naranja neón (`#FF5500`). |
| **WORKER** | Tarjeta con Banda | Tarjeta blanca con borde izquierdo rojo de 4px (`border-l-4`). | Tarjeta `#0A0F1D` con banda izquierda cyan neón de 4px resplandeciente. |

---

**Reglas de implementación CSS por Tema**

**Variables CSS recomendadas**
Define tokens de color en la raíz del canvas para alternar el tema cambiando una sola clase contenedora (`.theme-santander` o `.theme-neon`):

```css
/* Tema Santander */
.theme-santander {
  --bg-node: #ffffff;
  --border-primary: #ec0000;
  --border-secondary: #d1d5db;
  --bg-container: #f4f4f6;
  --text-main: #1f2937;
  --node-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Tema NEON */
.theme-neon {
  --bg-node: #0a0f1d;
  --border-primary: #00f0ff;
  --border-secondary: #ff007f;
  --bg-container: rgba(15, 23, 42, 0.75);
  --text-main: #f8fafc;
  --node-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}

```

**Rendimiento de los Efectos Neon**
Evita aplicar `box-shadow` dinámicos muy pesados a todos los nodos en el tema NEON simultáneamente si hay más de 50 nodos en pantalla. Utiliza `drop-shadow` en SVG o limita el brillo resplandeciente (`glow`) únicamente al estado `:hover` o nodo seleccionado (`:focus`).