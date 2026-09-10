export type NodeType = "HUB" | "DEPARTMENT" | "AREA" | "HUB2" | "PROCESS" | "SUBPROCESS" | "GROUP" | "AGENT" | "TOOL" | "WORKER" | "TASK" | "DECISION" | "KNOWLEDGE_BASE" | "ACTION" | "RESOURCE";

export type AIModel = "GPT-4o" | "Claude 3.5 Sonnet" | "Local Ollama";

export type ConnectionType = "data" | "control" | "fallback";

export type HandlePosition = "top" | "bottom" | "left" | "right";

export interface CustomNode {
  id: string;
  name: string;
  role: string;
  type: NodeType;
  department?: string;
  status?: "Active" | "Idle" | "Error";
  latency?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string;
  model?: AIModel;
  systemPrompt?: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  type?: ConnectionType;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  targetNodeId?: string;
}

export type SemanticTier = 1 | 2 | 3;

export const NODE_TIERS: Record<NodeType, SemanticTier> = {
  HUB: 1,
  DEPARTMENT: 1,
  AREA: 1,
  HUB2: 2,
  PROCESS: 2,
  GROUP: 2,
  SUBPROCESS: 2,
  AGENT: 3,
  TASK: 3,
  DECISION: 3,
  KNOWLEDGE_BASE: 3,
  ACTION: 3,
  RESOURCE: 3,
  TOOL: 3,
  WORKER: 3,
};

// Importar tanto ZOOM_FADE como ZOOM_LEVELS
import { ZOOM_FADE, ZOOM_LEVELS } from "@/config/nodeConfig";

// ✅ CORRECCIÓN 1: Ahora los saltos de zoom leen directamente de nodeConfig.ts
export const DISCRETE_ZOOM_LEVELS = [
  ZOOM_LEVELS.L1,
  ZOOM_LEVELS.L2,
  ZOOM_LEVELS.L3,
  ZOOM_LEVELS.L4,
] as const;

/**
 * Calcula la opacidad limpia (0.0 a 1.0) para cada nodo según los 4 niveles de zoom discretos.
 */
export function getNodeOpacity(nodeType: NodeType, scale: number, isSemanticZoomActive: boolean = true): number {
  if (!isSemanticZoomActive) return 1;

  const tier = NODE_TIERS[nodeType] || 3;
  const f = ZOOM_FADE;

  // HUB, DEPARTMENT y AREA (Nivel 1): visibles en Zoom 1 y Zoom 2, ocultos en Zoom 3+
  if (nodeType === "HUB" || nodeType === "DEPARTMENT" || nodeType === "AREA") {
    if (scale <= f.TIER1_FADE_OUT_START) return 1.0;
    if (scale <= f.TIER1_FADE_OUT_END)
      return 1.0 - (scale - f.TIER1_FADE_OUT_START) / (f.TIER1_FADE_OUT_END - f.TIER1_FADE_OUT_START);
    return 0;
  }

  // HUB2 (Sub área): oculto en Zoom 1, visible en Zoom 2, marco en Zoom 3+
  if (nodeType === "HUB2") {
    if (scale <= f.HUB2_FADE_IN_START) return 0;
    if (scale <= f.TIER2_FULL_BELOW) return 1.0;
    if (scale <= f.TIER2_FRAME_BELOW) return 0.35;
    return 0.1;
  }

  // Tier 2 (PROCESS, SUBPROCESS, GROUP): estructura de proceso
  if (tier === 2) {
    if (scale <= f.TIER2_HIDDEN_BELOW) return 0;
    if (scale <= f.TIER2_FULL_BELOW) return 1.0;
    if (scale <= f.TIER2_FRAME_BELOW) return 0.35;
    return 0.1;
  }

  // Tier 3 (TASK, AGENT, DECISION, …): operativo
  if (scale <= f.TIER3_HIDDEN_BELOW) return 0;
  // ✅ CORRECCIÓN 2: Se usa TIER3_PREVIEW_BELOW correctamente
  if (scale <= f.TIER3_PREVIEW_BELOW) return 0.7;
  return 1.0;
}