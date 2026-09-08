import { CustomNode, Connection } from "@/types";
import defaultPresetJson from "../../public/presets/diagrama-general-seguros.json";

export const DEFAULT_MACRO_PRESET = {
  theme: (defaultPresetJson.theme || "santander") as "neon" | "santander",
  nodes: (defaultPresetJson.nodes || []) as CustomNode[],
  connections: (defaultPresetJson.connections || []) as Connection[],
};
