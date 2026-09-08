import { create } from "zustand";
import { CustomNode, Connection, ConnectionType } from "@/types";
import { saveGraph } from "@/core/models/storage";

export type GraphTheme = "neon" | "santander";

export interface HistorySnapshot {
  nodes: CustomNode[];
  connections: Connection[];
}

interface GraphState {
  theme: GraphTheme;
  nodes: CustomNode[];
  connections: Connection[];
  selectedNodeIds: string[];
  selectedConnectionId: string | null;
  connectingSourceId: string | null;
  tempMousePos: { x: number; y: number } | null;
  isConnecting: boolean;
  isSimulating: boolean;

  // Historial
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Tema
  setTheme: (theme: GraphTheme) => void;

  // Selección Múltiple y Nodos
  setSelectedNodeIds: (ids: string[]) => void;
  toggleSelectNode: (id: string) => void;
  updateNode: (id: string, updatedData: Partial<CustomNode>) => void;
  updateMultipleNodes: (updates: { id: string; x: number; y: number }[]) => void;
  addGroupNode: (title: string, x: number, y: number, width?: number, height?: number) => void;
  deleteSelectedNodes: () => void;

  // Manejo de Conexiones
  startConnecting: (sourceId: string) => void;
  updateTempMousePos: (pos: { x: number; y: number } | null) => void;
  finishConnecting: (targetId: string) => void;
  cancelConnecting: () => void;
  selectConnection: (id: string | null) => void;
  deleteConnection: (id: string) => void;
  updateConnectionType: (id: string, type: ConnectionType) => void;

  // Simulación
  toggleSimulation: () => void;
  setSimulating: (isSimulating: boolean) => void;

  // Auto-Layout
  runAutoLayout: () => void;

  // Exportación e Importación
  exportGraphToJson: () => void;
  importGraphFromJson: (jsonString: string) => boolean;
  loadPresetTemplate: (nodes: CustomNode[], connections: Connection[]) => void;

  // Historial (Undo / Redo)
  recordSnapshot: () => void;
  undo: () => void;
  redo: () => void;
}

const INITIAL_NODES: CustomNode[] = [
  { id: "node-group-1", name: "Módulo Santander AI", role: "Zona de procesamiento", type: "GROUP" as any, status: "Active", x: 100, y: 100, width: 680, height: 420 },
  { id: "node-hub", name: "CORE BRAIN HUB", role: "Central Core", type: "HUB", department: "TECH", status: "Active", latency: "1ms", x: 400, y: 350, model: "GPT-4o", systemPrompt: "Eres el orquestador principal del sistema." },
  { id: "node-1", name: "Data Agent", role: "Vector Querying", type: "AGENT", department: "TECH", status: "Active", latency: "12ms", x: 180, y: 180, parentId: "node-hub", model: "Claude 3.5 Sonnet" },
  { id: "node-2", name: "Markdown Auditor", role: "Content Validation", type: "AGENT", department: "TECH", status: "Idle", latency: "45ms", x: 600, y: 180, parentId: "node-hub", model: "Local Ollama" },
];

const MAX_HISTORY = 25;

export const useGraphStore = create<GraphState>((set, get) => ({
  theme: "neon",
  nodes: INITIAL_NODES,
  connections: [
    { id: "c1", source: "node-hub", target: "node-1", type: "data" },
    { id: "c2", source: "node-hub", target: "node-2", type: "control" },
  ],
  selectedNodeIds: [],
  selectedConnectionId: null,
  connectingSourceId: null,
  tempMousePos: null,
  isConnecting: false,
  isSimulating: false,

  past: [],
  future: [],

  setTheme: (theme) => set({ theme }),

  recordSnapshot: () => {
    const { nodes, connections, past } = get();
    const snapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    };
    set({
      past: [...past, snapshot].slice(-MAX_HISTORY),
      future: [],
    });
  },

  undo: () => {
    const { past, future, nodes, connections } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentSnapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    };

    saveGraph(previous.nodes);
    set({
      nodes: previous.nodes,
      connections: previous.connections,
      past: newPast,
      future: [currentSnapshot, ...future],
      selectedNodeIds: [],
      selectedConnectionId: null,
    });
  },

  redo: () => {
    const { past, future, nodes, connections } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const currentSnapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    };

    saveGraph(next.nodes);
    set({
      nodes: next.nodes,
      connections: next.connections,
      past: [...past, currentSnapshot],
      future: newFuture,
      selectedNodeIds: [],
      selectedConnectionId: null,
    });
  },

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids, selectedConnectionId: null }),

  toggleSelectNode: (id) => {
    set((state) => {
      const exists = state.selectedNodeIds.includes(id);
      const newIds = exists
        ? state.selectedNodeIds.filter((nodeId) => nodeId !== id)
        : [...state.selectedNodeIds, id];
      return { selectedNodeIds: newIds, selectedConnectionId: null };
    });
  },

  updateNode: (id, updatedData) => {
    set((state) => {
      const newNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, ...updatedData } : node
      );
      saveGraph(newNodes);
      return { nodes: newNodes };
    });
  },

  updateMultipleNodes: (updates) => {
    set((state) => {
      const updateMap = new Map(updates.map((u) => [u.id, u]));
      const newNodes = state.nodes.map((node) => {
        const update = updateMap.get(node.id);
        return update ? { ...node, x: update.x, y: update.y } : node;
      });
      saveGraph(newNodes);
      return { nodes: newNodes };
    });
  },

  addGroupNode: (title, x, y, width = 400, height = 300) => {
    get().recordSnapshot();
    const id = `group-${Date.now()}`;
    const newGroup: CustomNode = {
      id,
      name: title,
      role: "Contenedor",
      type: "GROUP" as any,
      status: "Active",
      x,
      y,
      width,
      height,
    };
    set((state) => {
      const newNodes = [newGroup, ...state.nodes];
      saveGraph(newNodes);
      return { nodes: newNodes, selectedNodeIds: [id] };
    });
  },

  deleteSelectedNodes: () => {
    const { selectedNodeIds, nodes, connections, recordSnapshot } = get();
    if (selectedNodeIds.length === 0) return;

    recordSnapshot();
    const newNodes = nodes.filter((n) => !selectedNodeIds.includes(n.id));
    const newConnections = connections.filter(
      (c) => !selectedNodeIds.includes(c.source) && !selectedNodeIds.includes(c.target)
    );

    saveGraph(newNodes);
    set({ nodes: newNodes, connections: newConnections, selectedNodeIds: [] });
  },

  startConnecting: (sourceId) => set({ connectingSourceId: sourceId }),
  updateTempMousePos: (pos) => set({ tempMousePos: pos }),

  finishConnecting: (targetId) => {
    const { connectingSourceId, connections, recordSnapshot } = get();
    if (!connectingSourceId || connectingSourceId === targetId) {
      set({ connectingSourceId: null, tempMousePos: null });
      return;
    }

    const exists = connections.some(
      (c) =>
        (c.source === connectingSourceId && c.target === targetId) ||
        (c.source === targetId && c.target === connectingSourceId)
    );

    if (!exists) {
      recordSnapshot();
      const newConn: Connection = {
        id: `c-${Date.now()}`,
        source: connectingSourceId,
        target: targetId,
        type: "data",
      };
      set((state) => ({
        connections: [...state.connections, newConn],
        connectingSourceId: null,
        tempMousePos: null,
      }));
    } else {
      set({ connectingSourceId: null, tempMousePos: null });
    }
  },

  cancelConnecting: () => set({ connectingSourceId: null, tempMousePos: null }),

  selectConnection: (id) => set({ selectedConnectionId: id, selectedNodeIds: [] }),

  deleteConnection: (id) => {
    get().recordSnapshot();
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      selectedConnectionId: state.selectedConnectionId === id ? null : state.selectedConnectionId,
    }));
  },

  updateConnectionType: (id, type) => {
    get().recordSnapshot();
    set((state) => ({
      connections: state.connections.map((c) => (c.id === id ? { ...c, type } : c)),
    }));
  },

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),
  setSimulating: (isSimulating) => set({ isSimulating }),

  runAutoLayout: () => {
    const { nodes, connections, recordSnapshot } = get();
    if (nodes.length === 0) return;

    recordSnapshot();
    const standardNodes = nodes.filter((n) => (n.type as string) !== "GROUP");
    const groupNodes = nodes.filter((n) => (n.type as string) === "GROUP");

    const inDegree = new Map<string, number>();
    standardNodes.forEach((n) => inDegree.set(n.id, 0));

    connections.forEach((c) => {
      if (inDegree.has(c.target)) {
        inDegree.set(c.target, (inDegree.get(c.target) || 0) + 1);
      }
    });

    const levels = new Map<string, number>();
    const queue: string[] = [];

    standardNodes.forEach((n) => {
      if ((inDegree.get(n.id) || 0) === 0 || n.type === "HUB") {
        levels.set(n.id, 0);
        queue.push(n.id);
      }
    });

    if (queue.length === 0 && standardNodes.length > 0) {
      queue.push(standardNodes[0].id);
      levels.set(standardNodes[0].id, 0);
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = levels.get(currentId) || 0;

      const outgoing = connections.filter((c) => c.source === currentId);
      outgoing.forEach((c) => {
        if (!levels.has(c.target) || levels.get(c.target)! < currentLevel + 1) {
          levels.set(c.target, currentLevel + 1);
          queue.push(c.target);
        }
      });
    }

    standardNodes.forEach((n) => {
      if (!levels.has(n.id)) levels.set(n.id, 0);
    });

    const levelGroups = new Map<number, CustomNode[]>();
    standardNodes.forEach((n) => {
      const lvl = levels.get(n.id) || 0;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(n);
    });

    const X_SPACING = 280;
    const Y_SPACING = 160;

    const updatedStandardNodes = standardNodes.map((node) => {
      const lvl = levels.get(node.id) || 0;
      const nodesInLvl = levelGroups.get(lvl) || [];
      const indexInLvl = nodesInLvl.findIndex((n) => n.id === node.id);

      return {
        ...node,
        x: 120 + lvl * X_SPACING,
        y: 120 + indexInLvl * Y_SPACING,
      };
    });

    const newNodes = [...groupNodes, ...updatedStandardNodes];
    saveGraph(newNodes);
    set({ nodes: newNodes });
  },

  exportGraphToJson: () => {
    const { nodes, connections, theme } = get();
    const exportData = {
      version: "1.0",
      theme,
      createdAt: new Date().toISOString(),
      nodes,
      connections,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `santander-architecture-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importGraphFromJson: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
        get().recordSnapshot();
        set({
          nodes: parsed.nodes,
          connections: parsed.connections,
          theme: parsed.theme && ["neon", "santander"].includes(parsed.theme) ? parsed.theme : get().theme,
          selectedNodeIds: [],
          selectedConnectionId: null,
        });
        saveGraph(parsed.nodes);
        return true;
      }
    } catch (e) {
      console.error("Error al importar la arquitectura JSON:", e);
    }
    return false;
  },

  loadPresetTemplate: (nodes, connections) => {
    get().recordSnapshot();
    set({
      nodes,
      connections,
      selectedNodeIds: [],
      selectedConnectionId: null,
    });
    saveGraph(nodes);
  },
}));