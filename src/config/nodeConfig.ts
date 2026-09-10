/**
 * ============================================================
 *  nodeConfig.ts  —  Configuración Central de Nodos y Zoom
 * ============================================================
 *  Edita este archivo para ajustar tamaños, texto y niveles
 *  de zoom sin tocar los componentes individuales.
 *
 *  Archivos que lo consumen:
 *    - src/components/canvas/CanvasConnections.tsx   (dimensiones)
 *    - src/components/nodes/*                        (texto / iconos)
 *    - src/types/index.ts                            (opacidades de zoom)
 * ============================================================
 */

// ─────────────────────────────────────────────
//  1. NIVELES DE ZOOM  (factor de escala del canvas)
// ─────────────────────────────────────────────
export const ZOOM_LEVELS = {
  /** Vista global: solo HUB + AREA visibles */
  L1: 0.30,
  /** Vista de áreas: HUB2, PROCESS, SUBPROCESS */
  L2: 1,
  /** Vista operativa: TASK, AGENT, DECISION… */
  L3: 1.50,
  /** Vista detalle: todo visible */
  L4: 1.875,
} as const;

// ─────────────────────────────────────────────
//  2. DIMENSIONES DE NODOS  (píxeles a escala 1:1)
//     Para nodos GROUP / PROCESS se usa node.width/height del JSON
//     si existe; de lo contrario, se usa el valor de fallback aquí.
// ─────────────────────────────────────────────
export const NODE_SIZES = {
  HUB:            { width: 500, height: 500 },  // Círculo principal
  DEPARTMENT:     { width: 450, height: 450 },  // Círculo intermedio (departamentos)
  AREA:           { width: 400, height: 400 },  // Círculo nivel 1 (áreas de negocio)
  HUB2:           { width: 300, height: 300 },  // Círculo nivel 2 (sub áreas)  ← se minimiza a MINIMIZED_SCALE
  GROUP:          { width: 480, height: 320 },  // Contenedor libre (fallback)
  PROCESS:        { width: 480, height: 320 },  // Contenedor de proceso (fallback)
  SUBPROCESS:     { width: 150, height: 60  },
  AGENT:          { width: 180, height: 90  },
  KNOWLEDGE_BASE: { width: 180, height: 90  },
  TASK:           { width: 160, height: 70  },
  DECISION:       { width: 90,  height: 90  },
  ACTION:         { width: 140, height: 40  },
  RESOURCE:       { width: 90,  height: 65  },
  TOOL:           { width: 65,  height: 50  },
  WORKER:         { width: 130, height: 42  },
} as const;

/**
 * Escala CSS aplicada a AREA y HUB2 cuando el zoom supera 0.8
 * (aparecen "miniaturizados" para dejar paso al nivel inferior).
 * Valor 1.0 = sin miniaturizar.
 */
export const MINIMIZED_SCALE = 0.45;

// ─────────────────────────────────────────────
//  3. TIPOGRAFÍA  (font-size en px por tipo de nodo)
//     title    → nombre principal del nodo
//     subtitle → rol / descripción secundaria
//     meta     → latencia, estado, etiqueta pequeña
// ─────────────────────────────────────────────
export const NODE_TEXT = {
  HUB:            { title: 40, subtitle: 16, meta: 14 },
  DEPARTMENT:     { title: 35, subtitle: 15, meta: 13 },
  AREA:           { title: 40, subtitle: 14, meta: 12 },
  HUB2:           { title: 30, subtitle: 14, meta: 12 },
  GROUP:          { title: 13, subtitle: 11, meta: 10 },
  PROCESS:        { title: 13, subtitle: 11, meta: 10 },
  SUBPROCESS:     { title: 11, subtitle:  9, meta:  8 },
  AGENT:          { title: 13, subtitle: 10, meta:  9 },
  KNOWLEDGE_BASE: { title: 12, subtitle: 10, meta:  9 },
  TASK:           { title: 12, subtitle: 10, meta:  9 },
  DECISION:       { title: 10, subtitle:  8, meta:  8 },
  ACTION:         { title: 10, subtitle:  8, meta:  8 },
  RESOURCE:       { title: 10, subtitle:  8, meta:  8 },
  TOOL:           { title: 10, subtitle:  8, meta:  8 },
  WORKER:         { title:  8, subtitle:  7, meta:  7 },
} as const;

// ─────────────────────────────────────────────
//  4. VISIBILIDAD POR ZOOM
//     Cuándo aparece / desaparece cada nodo según el zoom del canvas.
//     Los valores coinciden con la lógica en src/types/index.ts
//     ─────────────────────────────────────────
//     Tier 1 (HUB, AREA)
//       Visibles desde L1 hasta L2; se desvanecen entre 1.30 y 1.45
//     Tier 2 (HUB2, PROCESS, SUBPROCESS, GROUP)
//       HUB2:  aparece en L2 (fade-in 0.70→0.90), desaparece en L3
//       Resto: ocultos en L1, 100% en L2, marco en L3, casi invisible en L4
//     Tier 3 (TASK, AGENT, DECISION, …)
//       Ocultos en L1, 70% en L2, 100% en L3+
// ─────────────────────────────────────────────
export const ZOOM_FADE = {
  /** HUB y AREA: desvanecimiento de salida */
  TIER1_FADE_OUT_START : 1,
  TIER1_FADE_OUT_END   : 1.45,

  /** HUB2: umbral de aparición en L2 */
  HUB2_FADE_IN_START   : 1,

  /** Tier 2 general: umbral en el que pasan de ocultos a visibles */
  TIER2_HIDDEN_BELOW   : 0.70,   // escala ≤ este valor → opacidad 0
  TIER2_FULL_BELOW     : 1.30,   // entre 0.70 y 1.30 → opacidad 1.0
  TIER2_FRAME_BELOW    : 1.65,   // entre 1.30 y 1.65 → opacidad 0.35 (solo borde)
  // escala > 1.65 → opacidad 0.10 (casi invisible)

  /** Tier 3: umbral de aparición */
  TIER3_HIDDEN_BELOW   : 0.70,   // escala ≤ este valor → opacidad 0
  TIER3_PREVIEW_BELOW  : 1.30,   // entre 0.70 y 1.30 → opacidad 0.70
  // escala > 1.30 → opacidad 1.0
} as const;
