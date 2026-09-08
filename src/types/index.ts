export type NodeType = "HUB" | "HUB2" | "PROCESS" | "SUBPROCESS" | "GROUP" | "AGENT" | "TOOL" | "WORKER" | "TASK" | "DECISION" | "KNOWLEDGE_BASE" | "ACTION" | "RESOURCE";

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
  HUB2: 1,
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

export const DISCRETE_ZOOM_LEVELS = [0.5, 1.125, 1.5, 1.875] as const;

/**
 * Calcula la opacidad limpia (0.0 a 1.0) para cada nodo según los 4 niveles de zoom discretos:
 * - 50%: Nivel 1 (HUB / HUB2 - Orquestador y Áreas Principales)
 * - 112.5%: Nivel 2 (SUBPROCESS / GROUP - Áreas y Subprocesos de Negocio)
 * - 150%: Nivel 3 (TASK, AGENT, DECISION, etc. - Tareas y Operatividad)
 * - 187.5%: Nivel 4 Ampliado (Detalle de Ejecución)
 */
export function getNodeOpacity(nodeType: NodeType, scale: number, isSemanticZoomActive: boolean = true): number {
  if (!isSemanticZoomActive) return 1;

  const tier = NODE_TIERS[nodeType] || 3;

  // HUB (Nodo Central): Visible en Zoom 1 (50%), Oculto en Zoom 2+
  if (nodeType === "HUB") {
    if (scale <= 0.6) return 1.0;
    if (scale <= 0.9) return 1.0 - (scale - 0.6) / (0.9 - 0.6);
    return 0;
  }

  // HUB2 (Sub área): Visible en Zoom 1 (50%) Y en Zoom 2 (112.5%), Oculto en Zoom 3+
  if (nodeType === "HUB2") {
    if (scale <= 1.3) return 1.0;
    if (scale <= 1.45) return 1.0 - (scale - 1.3) / (1.45 - 1.3);
    return 0;
  }

  // Tier 2 (PROCESS, SUBPROCESS, GROUP): Estructura
  // Zoom 1 (0.5): 70% (Resumen) | Zoom 2 (1.125): 100% (Principal) | Zoom 3 (1.5): Marco Contenedor | Zoom 4 (1.875): Transparente (Solo área)
  if (tier === 2) {
    if (scale <= 0.7) return 0; // Zoom 1 (50%): 0% Oculto (El usuario especificó que Proceso no debe aparecer)
    if (scale <= 1.3) return 1.0; // Zoom 2 (112.5%): 100% Principal
    if (scale <= 1.65) return 0.35; // Zoom 3 (150%): Marco Contenedor (Borde/Agrupador)
    return 0.1; // Zoom 4 (187.5%): Transparente / Solo área
  }

  // Tier 3 (TASK, AGENT, DECISION, KNOWLEDGE_BASE, ACTION, RESOURCE, TOOL, WORKER): Operativo
  // Zoom 1 (0.5): 0% (Oculto) | Zoom 2 (1.125): 70% (Preview) | Zoom 3 (1.5) & Zoom 4 (1.875): 100% (Principal / Detalle)
  if (scale <= 0.7) return 0; // Zoom 1 (50%): 0% Oculto
  if (scale <= 1.3) return 0.7; // Zoom 2 (112.5%): 70% Preview
  return 1.0; // Zoom 3 (150%) & Zoom 4 (187.5%): 100% Principal / Expandido
}