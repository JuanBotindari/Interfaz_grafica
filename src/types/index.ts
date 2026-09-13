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

import {
  getNodeOpacityForZoom,
  DISCRETE_ZOOM_LEVELS,
  NODE_TIERS
} from "@/config/nodeConfig";

export { DISCRETE_ZOOM_LEVELS, NODE_TIERS };

/**
 * Calcula la opacidad limpia (0.0 a 1.0) para cada nodo según el nuevo nodeConfig.ts
 */
export function getNodeOpacity(nodeType: NodeType, scale: number, isSemanticZoomActive: boolean = true): number {
  return getNodeOpacityForZoom(nodeType, scale, isSemanticZoomActive);
}