import { DEFAULT_MACRO_PRESET } from "./defaultPreset";
import { CustomNode, Connection } from "@/types";

const STORAGE_KEY = "graph_state_v1";

export interface StoredGraphData {
  nodes: CustomNode[];
  connections: Connection[];
  theme?: string;
}

export const saveGraph = (data: unknown): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error guardando en localStorage:", error);
  }
};

export const loadGraph = (): StoredGraphData => {
  const fallback = {
    nodes: DEFAULT_MACRO_PRESET.nodes,
    connections: DEFAULT_MACRO_PRESET.connections,
    theme: DEFAULT_MACRO_PRESET.theme,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return fallback;

    const parsed = JSON.parse(item);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { nodes: parsed, connections: [], theme: DEFAULT_MACRO_PRESET.theme };
    } else if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
      return {
        nodes: parsed.nodes,
        connections: Array.isArray(parsed.connections) ? parsed.connections : [],
        theme: parsed.theme || DEFAULT_MACRO_PRESET.theme,
      };
    }
  } catch (error) {
    console.error("Error cargando de localStorage, aplicando fallback preset:", error);
  }

  return fallback;
};