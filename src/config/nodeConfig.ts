/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  nodeConfig.ts  —  PANEL DE CONTROL DE NODOS Y ZOOM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  EDITÁ SOLO ESTE ARCHIVO para probar tamaños, visibilidad y escalas.
 *
 * ─── CÓMO FUNCIONA EL ZOOM ───────────────────────────────────────────────
 *
 *  1. ZOOM DEL CANVAS (ZOOM_LEVELS)
 *     Es el "alejamiento" de la cámara. Con la rueda del mouse o +/- saltás
 *     entre 4 niveles fijos: L1 → L2 → L3 → L4.
 *
 *     L1 = vista lejana  (organización: Santander + departamentos)
 *     L2 = vista media   (departamento + áreas)
 *     L3 = vista cercana (área + procesos / agentes)
 *     L4 = vista detalle (todo operativo)
 *
 *  2. VISIBILIDAD (NODE_VISIBILITY)
 *     Opacidad de cada tipo de nodo en cada nivel. Rango: 0 a 1.
 *       0   = invisible (no se renderiza)
 *       0.5 = semitransparente
 *       1   = totalmente visible
 *
 *  3. MULTIPLICADOR DE TAMAÑO (NODE_SCALE)  ← esto es lo que buscás
 *     Define cuán grande se ve cada nodo EN PANTALLA en cada nivel L1–L4.
 *     Relativo al tamaño base (NODE_SIZES):
 *       1.0  = tamaño completo (100 % del NODE_SIZES)
 *       0.45 = miniatura
 *       1.2  = 20 % más grande que el base
 *
 *     El sistema COMPENSA el zoom de cámara automáticamente (ver
 *     SCALE_COMPENSATES_CAMERA). Así, si ponés HUB.L2 = 0.4, el HUB
 *     se verá al 40 % aunque la cámara esté en L2 — sin calcular nada.
 *
 *     Tamaño final en pantalla ≈ NODE_SIZES × NODE_SCALE[nivel]
 *     (la cámara ya está compensada por dentro)
 *
 *  4. TAMAÑO BASE (NODE_SIZES)
 *     Ancho y alto en píxeles a escala 1:1 del canvas (antes de multiplicadores).
 *
 *  5. CLIC EN NODO (CLICK_ZOOM)
 *     En modo vista, al hacer clic en un nodo la cámara salta a esa escala.
 *
 * ─── TIPS PARA PROBAR ────────────────────────────────────────────────────
 *
 *  • ¿Querés ver solo Santander + deptos en L1? → AREA en L1 = 0
 *  • ¿Deptos más chicos que el HUB en L1?
 *       NODE_SCALE.DEPARTMENT.L1 = 0.75
 *  • ¿HUB se achica al pasar a L2?
 *       NODE_SCALE.HUB.L1 = 1.0  →  NODE_SCALE.HUB.L2 = 0.35
 *  • ¿Área crece al entrar en L3?
 *       NODE_SCALE.AREA.L3 = 1.0  (y L2 = 0.85)
 *  • ¿Agentes solo en L4? → NODE_VISIBILITY.AGENT L1-L3 = 0
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { CustomNode, HandlePosition, NodeType } from "@/types";

/** Tipos renderizados como círculo (puntos de conexión en el borde del círculo) */
export const CIRCLE_NODE_TYPES: NodeType[] = ["HUB", "DEPARTMENT", "AREA", "HUB2"];

export interface NodeVisualBounds {
  /** Centro X/Y en coordenadas del canvas (mismo espacio que node.x / node.y) */
  cx: number;
  cy: number;
  /** Tamaño visual actual (base × NODE_SCALE compensado) */
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** Multiplicador CSS aplicado al nodo */
  scale: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. NIVELES DE ZOOM DEL CANVAS
//    Factor de escala global. Valores más bajos = vista más alejada.
// ─────────────────────────────────────────────────────────────────────────────
export type ZoomLevelKey = "L1" | "L2" | "L3" | "L4";

export const ZOOM_LEVEL_KEYS: ZoomLevelKey[] = ["L1", "L2", "L3", "L4"];

export const ZOOM_LEVELS: Record<ZoomLevelKey, number> = {
  /** L1 — Organización: Santander + departamentos */
  L1: 0.2,
  /** L2 — Departamento: depto foco + áreas */
  L2: 0.6,
  /** L3 — Área: área foco + procesos / subnodos */
  L3: 1.5,
  /** L4 — Detalle: agentes, tareas, operativa */
  L4: 1.875,
};

/** Lista ordenada usada por la rueda del mouse y los botones +/- */
export const DISCRETE_ZOOM_LEVELS = ZOOM_LEVEL_KEYS.map((k) => ZOOM_LEVELS[k]);

// ─────────────────────────────────────────────────────────────────────────────
// 2. COMPORTAMIENTO GENERAL DEL ZOOM SEMÁNTICO
// ─────────────────────────────────────────────────────────────────────────────
export const SEMANTIC_ZOOM = {
  /** Interpola suavemente visibilidad y tamaño entre L1↔L2↔L3↔L4 */
  INTERPOLATE_BETWEEN_LEVELS: true,
  /** Por debajo de esta opacidad el nodo no se renderiza */
  HIDE_BELOW_OPACITY: 0.02,
  /**
   * true = NODE_SCALE es el tamaño EN PANTALLA (compensa el zoom de cámara).
   * false = NODE_SCALE se multiplica encima del zoom de cámara (efecto doble).
   */
  SCALE_COMPENSATES_CAMERA: true,
  /** Nivel donde NODE_SCALE = 1.0 equivale al tamaño base sin compensación extra */
  REFERENCE_ZOOM_LEVEL: "L2" as ZoomLevelKey,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 3. TIER SEMÁNTICO (agrupa tipos para clic y lógica general)
//    Tier 1 = estructura alta  |  Tier 2 = procesos  |  Tier 3 = operativa
// ─────────────────────────────────────────────────────────────────────────────
export const NODE_TIERS: Record<NodeType, 1 | 2 | 3> = {
  HUB           : 1,
  DEPARTMENT    : 1,
  AREA          : 2,
  HUB2          : 2,
  PROCESS       : 2,
  GROUP         : 2,
  SUBPROCESS    : 2,
  AGENT         : 3,
  TASK          : 3,
  DECISION      : 3,
  KNOWLEDGE_BASE: 3,
  ACTION        : 3,
  RESOURCE      : 3,
  TOOL          : 3,
  WORKER        : 3,
  NOTE          : 3,
};

/** Escala del canvas al hacer clic en un nodo (modo vista) según su tier */
export const CLICK_ZOOM = {
  TIER_1: 0.75,
  TIER_2: 1.0,
  TIER_3: 1.25,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. TAMAÑO BASE DE CADA NODO (px a escala 1:1)
//    GROUP / PROCESS usan node.width/height del JSON si existen.
// ─────────────────────────────────────────────────────────────────────────────
export const NODE_SIZES = {
  HUB           : { width: 350, height: 350 },
  DEPARTMENT    : { width: 400, height: 160 },
  AREA          : { width: 288, height: 192 },
  HUB2          : { width: 270, height: 250 },
  GROUP         : { width: 240, height: 140 },
  PROCESS       : { width: 290, height: 140 },
  SUBPROCESS    : { width: 250, height:  64 },
  AGENT         : { width: 180, height:  90 },
  KNOWLEDGE_BASE: { width: 180, height:  90 },
  TASK          : { width: 160, height:  56 },
  DECISION      : { width:  90, height:  90 },
  ACTION        : { width: 140, height:  40 },
  RESOURCE      : { width: 140, height:  70 },
  TOOL          : { width: 140, height:  50 },
  WORKER        : { width: 144, height:  48 },
  NOTE          : { width: 160, height: 160 },
} as const;

export const NODE_CLIPS = {
  OCTAGON: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  HEXAGON: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  FOLDED_CORNER: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
  CHAMFERED: "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 5. VISIBILIDAD POR NIVEL DE ZOOM
//    Opacidad 0–1 para cada tipo de nodo en L1, L2, L3 y L4.
// ─────────────────────────────────────────────────────────────────────────────
type VisibilityMap = Record<ZoomLevelKey, number>;

export const NODE_VISIBILITY: Record<NodeType, VisibilityMap> = {
  // ── Estructura (Tier 1) ──
  HUB           : { L1: 1.0, L2: 0.0, L3: 0.0, L4: 0.0 },
  DEPARTMENT    : { L1: 1.0, L2: 1.0,  L3: 0.35, L4: 0.15 },
  AREA          : { L1: 0.0, L2: 1.0,  L3: 0.5,  L4: 0.2 },

  // ── Procesos / Sub-áreas (Tier 2) ──
  HUB2          : { L1: 0.0, L2: 0.85, L3: 1.0,  L4: 0.35 },
  PROCESS       : { L1: 0.0, L2: 0.8,  L3: 1.0,  L4: 0.35 },
  GROUP         : { L1: 0.0, L2: 0.8,  L3: 1.0,  L4: 0.35 },
  SUBPROCESS    : { L1: 0.0, L2: 0.75, L3: 1.0,  L4: 0.50 },

  // ── Operativa (Tier 3) ──
  AGENT         : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  TASK          : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  DECISION      : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  KNOWLEDGE_BASE: { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  ACTION        : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  RESOURCE      : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  TOOL          : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  WORKER        : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
  NOTE          : { L1: 0.0, L2: 0.0,  L3: 0.7,  L4: 1.0 },
};


// ─────────────────────────────────────────────────────────────────────────────
// 6. MULTIPLICADOR DE TAMAÑO POR NIVEL DE ZOOM
//
//    Tamaño en pantalla = NODE_SIZES × valor de esta tabla (con cámara compensada).
//
//    Jerarquía visual sugerida:
//      L1 → HUB grande, deptos medianos
//      L2 → depto grande, HUB mini, áreas medianas
//      L3 → área grande, estructura mini, procesos normales
//      L4 → operativa a tamaño completo, resto mini
// ─────────────────────────────────────────────────────────────────────────────
type ScaleMap = Record<ZoomLevelKey, number>;

export const NODE_SCALE: Record<NodeType, ScaleMap> = {
  // ── Estructura (cambian mucho entre niveles) ──
  HUB:            { L1: 1.0,  L2: 0.35, L3: 0.25, L4: 0.2  },
  DEPARTMENT:     { L1: 0.6,  L2: 1.0,  L3: 0.35, L4: 0.25 },
  AREA:           { L1: 0.0,  L2: 0.8, L3: 1.0,  L4: 0.4  },

  // ── Procesos (aparecen y crecen en L2–L3) ──
  HUB2:           { L1: 0.0,  L2: 0.75, L3: 0.9,  L4: 0.45 },
  PROCESS:        { L1: 0.0,  L2: 0.75, L3: 1.0,  L4: 0.5  },
  GROUP:          { L1: 0.0,  L2: 0.75, L3: 1.0,  L4: 0.5  },
  SUBPROCESS:     { L1: 0.0,  L2: 0.7,  L3: 0.95, L4: 0.6  },

  // ── Operativa (tamaño completo solo en L3–L4) ──
  AGENT:          { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  TASK:           { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  DECISION:       { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  KNOWLEDGE_BASE: { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  ACTION:         { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  RESOURCE:       { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  TOOL:           { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  WORKER:         { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
  NOTE:           { L1: 0.0, L2: 0.0, L3: 0.85, L4: 1.0 },
};

/**
 * @deprecated Usá NODE_SCALE por tipo. Se mantiene por compatibilidad.
 * Equivalente a NODE_SCALE.DEPARTMENT.L2 (y similares) cuando el zoom > 0.8.
 */
export const MINIMIZED_SCALE = 0.45;

// ─────────────────────────────────────────────────────────────────────────────
// 7. TIPOGRAFÍA (font-size en px)
// ─────────────────────────────────────────────────────────────────────────────
export const NODE_TEXT = {
  HUB           : { title: 40, subtitle: 20, meta: 20 },
  DEPARTMENT    : { title: 40, subtitle: 50, meta: 50 },
  AREA          : { title: 30, subtitle: 10, meta:  9 },
  HUB2          : { title: 25, subtitle: 14, meta: 12 },
  GROUP         : { title: 13, subtitle: 11, meta: 10 },
  PROCESS       : { title: 13, subtitle: 11, meta: 10 },
  SUBPROCESS    : { title: 18, subtitle:  9, meta:  8 },
  AGENT         : { title: 13, subtitle: 10, meta:  9 },
  KNOWLEDGE_BASE: { title: 12, subtitle: 10, meta:  9 },
  TASK          : { title: 12, subtitle: 10, meta:  9 },
  DECISION      : { title: 10, subtitle:  8, meta:  8 },
  ACTION        : { title: 10, subtitle:  8, meta:  8 },
  RESOURCE      : { title: 10, subtitle:  8, meta:  8 },
  TOOL          : { title: 10, subtitle:  8, meta:  8 },
  WORKER        : { title:  8, subtitle:  7, meta:  7 },
  NOTE          : { title: 11, subtitle:  9, meta:  8 },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  FUNCIONES (no hace falta tocarlas para probar valores)
// ═══════════════════════════════════════════════════════════════════════════

function interpolateMatrixValue(
  matrix: Record<NodeType, Record<ZoomLevelKey, number>>,
  nodeType: NodeType,
  canvasScale: number
): number {
  const row = matrix[nodeType];
  if (!row) return 1;

  const scales = ZOOM_LEVEL_KEYS.map((k) => ZOOM_LEVELS[k]);

  if (canvasScale <= scales[0]) return row.L1;
  if (canvasScale >= scales[scales.length - 1]) return row.L4;

  for (let i = 0; i < scales.length - 1; i++) {
    const lo = scales[i];
    const hi = scales[i + 1];
    if (canvasScale >= lo && canvasScale <= hi) {
      const keyA = ZOOM_LEVEL_KEYS[i];
      const keyB = ZOOM_LEVEL_KEYS[i + 1];
      const t = (canvasScale - lo) / (hi - lo);
      return row[keyA] + (row[keyB] - row[keyA]) * t;
    }
  }

  return 1;
}

function discreteMatrixValue(
  matrix: Record<NodeType, Record<ZoomLevelKey, number>>,
  nodeType: NodeType,
  canvasScale: number
): number {
  let bestKey: ZoomLevelKey = "L1";
  let minDiff = Infinity;
  for (const key of ZOOM_LEVEL_KEYS) {
    const diff = Math.abs(canvasScale - ZOOM_LEVELS[key]);
    if (diff < minDiff) {
      minDiff = diff;
      bestKey = key;
    }
  }
  return matrix[nodeType]?.[bestKey] ?? 1;
}

function matrixValue(
  matrix: Record<NodeType, Record<ZoomLevelKey, number>>,
  nodeType: NodeType,
  canvasScale: number
): number {
  if (SEMANTIC_ZOOM.INTERPOLATE_BETWEEN_LEVELS) {
    return interpolateMatrixValue(matrix, nodeType, canvasScale);
  }
  return discreteMatrixValue(matrix, nodeType, canvasScale);
}

/** Índice 0–3 del nivel de zoom más cercano a la escala actual */
export function getClosestZoomLevelIndex(canvasScale: number): number {
  let bestIdx = 0;
  let minDiff = Infinity;
  DISCRETE_ZOOM_LEVELS.forEach((level, idx) => {
    const diff = Math.abs(level - canvasScale);
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

/** Clave L1–L4 del nivel de zoom más cercano */
export function getClosestZoomLevelKey(canvasScale: number): ZoomLevelKey {
  return ZOOM_LEVEL_KEYS[getClosestZoomLevelIndex(canvasScale)];
}

/** Opacidad del nodo según NODE_VISIBILITY y escala del canvas */
export function getNodeOpacityForZoom(
  nodeType: NodeType,
  canvasScale: number,
  isSemanticZoomActive = true
): number {
  if (!isSemanticZoomActive) return 1;
  return matrixValue(NODE_VISIBILITY, nodeType, canvasScale);
}

/**
 * Multiplicador CSS aplicado al nodo.
 * Lee NODE_SCALE y, si SCALE_COMPENSATES_CAMERA está activo, neutraliza
 * el zoom de cámara para que el valor del config sea el tamaño en pantalla.
 */
export function getNodeScaleForZoom(
  nodeType: NodeType,
  canvasScale: number,
  isSemanticZoomActive = true
): number {
  if (!isSemanticZoomActive) return 1;

  const desiredScreenScale = matrixValue(NODE_SCALE, nodeType, canvasScale);
  if (desiredScreenScale <= 0) return 0;

  if (!SEMANTIC_ZOOM.SCALE_COMPENSATES_CAMERA || canvasScale <= 0) {
    return desiredScreenScale;
  }

  const refZoom = ZOOM_LEVELS[SEMANTIC_ZOOM.REFERENCE_ZOOM_LEVEL];
  return desiredScreenScale * (refZoom / canvasScale);
}

/** Tamaño en píxeles de pantalla (aprox.) para debug / UI */
export function getNodeScreenSizeForZoom(
  node: CustomNode,
  canvasScale: number,
  isSemanticZoomActive = true
): { width: number; height: number } {
  const base = getBaseNodeDimensions(node);
  const mult = getNodeScaleForZoom(node.type, canvasScale, isSemanticZoomActive);
  const camera = isSemanticZoomActive ? canvasScale : 1;
  return { width: base.width * mult * camera, height: base.height * mult * camera };
}

/** Escala de canvas al hacer clic según tier del nodo */
export function getClickZoomForTier(tier: 1 | 2 | 3): number {
  switch (tier) {
    case 1:
      return CLICK_ZOOM.TIER_1;
    case 2:
      return CLICK_ZOOM.TIER_2;
    case 3:
      return CLICK_ZOOM.TIER_3;
  }
}

/** Dimensiones base sin multiplicadores */
export function getBaseNodeDimensions(node: CustomNode): { width: number; height: number } {
  const s = NODE_SIZES;
  switch (node.type) {
    case "HUB":
      return s.HUB;
    case "DEPARTMENT":
      return s.DEPARTMENT;
    case "AREA":
      return s.AREA;
    case "HUB2":
      return s.HUB2;
    case "GROUP":
    case "PROCESS":
      return { width: node.width || s.PROCESS.width, height: node.height || s.PROCESS.height };
    case "SUBPROCESS":
      return s.SUBPROCESS;
    case "AGENT":
      return s.AGENT;
    case "KNOWLEDGE_BASE":
      return { width: node.width || s.KNOWLEDGE_BASE.width, height: node.height || s.KNOWLEDGE_BASE.height };
    case "NOTE":
      return { width: node.width || s.NOTE.width, height: node.height || s.NOTE.height };
    case "TASK":
      return s.TASK;
    case "DECISION":
      return s.DECISION;
    case "ACTION":
      return s.ACTION;
    case "RESOURCE":
      return s.RESOURCE;
    case "TOOL":
      return s.TOOL;
    case "WORKER":
      return s.WORKER;
    default:
      return s.TASK;
  }
}

/**
 * Bounds visuales del nodo en el canvas.
 * Fuente única de verdad para renderizado y conexiones.
 * El centro es fijo (node.x/y + mitad del tamaño base); solo cambia width/height al escalar.
 */
export function getNodeVisualBounds(
  node: CustomNode,
  canvasScale: number,
  isSemanticZoomActive = true
): NodeVisualBounds {
  const base = getBaseNodeDimensions(node);
  const scale = getNodeScaleForZoom(node.type, canvasScale, isSemanticZoomActive);
  const width = base.width * scale;
  const height = base.height * scale;
  const cx = node.x + base.width / 2;
  const cy = node.y + base.height / 2;

  return {
    cx,
    cy,
    width,
    height,
    left: cx - width / 2,
    top: cy - height / 2,
    right: cx + width / 2,
    bottom: cy + height / 2,
    scale,
  };
}

/** Dimensiones efectivas (alias de getNodeVisualBounds) */
export function getNodeDimensionsForZoom(
  node: CustomNode,
  canvasScale: number,
  isSemanticZoomActive = true
): { width: number; height: number } {
  const b = getNodeVisualBounds(node, canvasScale, isSemanticZoomActive);
  return { width: b.width, height: b.height };
}

/** Punto de conexión en el borde del tamaño visual actual del nodo */
export function getNodeConnectionPoint(
  node: CustomNode,
  handle: HandlePosition,
  canvasScale: number,
  isSemanticZoomActive = true
): { x: number; y: number; side: HandlePosition } {
  const b = getNodeVisualBounds(node, canvasScale, isSemanticZoomActive);
  const isCircle = CIRCLE_NODE_TYPES.includes(node.type);

  if (isCircle) {
    const r = Math.min(b.width, b.height) / 2;
    switch (handle) {
      case "top":
        return { x: b.cx, y: b.cy - r, side: handle };
      case "bottom":
        return { x: b.cx, y: b.cy + r, side: handle };
      case "left":
        return { x: b.cx - r, y: b.cy, side: handle };
      case "right":
        return { x: b.cx + r, y: b.cy, side: handle };
    }
  }

  switch (handle) {
    case "top":
      return { x: b.cx, y: b.top, side: handle };
    case "bottom":
      return { x: b.cx, y: b.bottom, side: handle };
    case "left":
      return { x: b.left, y: b.cy, side: handle };
    case "right":
      return { x: b.right, y: b.cy, side: handle };
  }
}
