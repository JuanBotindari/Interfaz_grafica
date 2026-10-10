"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { CustomNode, ContextMenuState, NodeType, getNodeOpacity, NODE_TIERS, DISCRETE_ZOOM_LEVELS } from "@/types";
import { getClickZoomForTier, getInternalNodeIds, getBaseNodeDimensions } from "@/config/nodeConfig";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { ArrowLeft } from "lucide-react";

// Componentes UI
import CanvasConnections from "./CanvasConnections";
import ContextMenu from "@/components/ui/ContextMenu";
import NodeInspector from "@/components/ui/NodeInspector";
import CanvasControls from "@/components/ui/CanvasControls";
import Sidebar from "@/components/ui/Sidebar";
import MiniMap from "@/components/ui/MiniMap";

// Vistas de Nodos
import NodoNivel1 from "@/components/nodes/NodoNivel1";
import NodoNivel2 from "@/components/nodes/NodoNivel2";
import NodoNivel3 from "@/components/nodes/NodoNivel3";
import NodoNivel4 from "@/components/nodes/NodoNivel4";
import { CircleNodeView } from "@/components/nodes/CircleNodeView";
import AreaNodeView from "@/components/nodes/AreaNodeView";
import DepartmentNodeView from "@/components/nodes/DepartmentNodeView";
import { TextCardView } from "@/components/nodes/TextCardView";
import { GroupNodeView } from "@/components/nodes/GroupNodeView";
import ProcessNode from "@/components/nodes/ProcessNode";
import TaskNode from "@/components/nodes/TaskNode";
import DecisionNode from "@/components/nodes/DecisionNode";
import SubprocessNode from "@/components/nodes/SubprocessNode";
import KnowledgeBaseNode from "@/components/nodes/KnowledgeBaseNode";
import ActionNode from "@/components/nodes/ActionNode";
import ResourceNode from "@/components/nodes/ResourceNode";

export default function AgentCanvas() {
  const {
    nodes,
    theme,
    selectedNodeIds,
    setSelectedNodeIds,
    toggleSelectNode,
    updateMultipleNodes,
    connectingSourceId,
    updateTempMousePos,
    cancelConnecting,
    selectConnection,
    recordSnapshot,
    undo,
    redo,
    deleteSelectedNodes,
    deleteConnection,
    selectedConnectionId,
    saveToFile,
    addGroupNode,
    editorMode,
    drilledNodeId,
    enterDrillDown,
    exitDrillDown,
    openNodeDetails,
    closeNodeDetails,
    connections,
  } = useGraphStore();

  const themeConfig = getThemeConfig(theme);

  const [isMounted, setIsMounted] = useState(false);
  const [{ scale, position }, setViewport] = useState({
    scale: DISCRETE_ZOOM_LEVELS[0],
    position: { x: 0, y: 0 },
  });
  const setScale = (s: number | ((prev: number) => number)) => {
    setViewport((prev) => ({
      ...prev,
      scale: typeof s === "function" ? s(prev.scale) : s,
    }));
  };
  const setPosition = (p: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    setViewport((prev) => ({
      ...prev,
      position: typeof p === "function" ? p(prev.position) : p,
    }));
  };

  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isSemanticZoomActive, setIsSemanticZoomActive] = useState(true);

  // Animación Suave de Zoom (Curva de transición fluida con requestAnimationFrame)
  const targetScaleRef = useRef<number>(DISCRETE_ZOOM_LEVELS[0]);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const prevDrilledRef = useRef<string | null>(null);

  const centerOnNodes = (s: number = targetScaleRef.current) => {
    const currentNodes = useGraphStore.getState().nodes;
    if (!currentNodes || currentNodes.length === 0) {
      animateZoom(s, { x: 0, y: 0 });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    currentNodes.forEach((n) => {
      const dims = getBaseNodeDimensions(n);
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + dims.width > maxX) maxX = n.x + dims.width;
      if (n.y + dims.height > maxY) maxY = n.y + dims.height;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const rect = canvasRef.current?.getBoundingClientRect();
    const viewWidth = rect ? rect.width : (typeof window !== "undefined" ? window.innerWidth : 1200);
    const viewHeight = rect ? rect.height : (typeof window !== "undefined" ? window.innerHeight : 800);

    const targetX = viewWidth / 2 - centerX * s;
    const targetY = viewHeight / 2 - centerY * s;

    animateZoom(s, { x: targetX, y: targetY }, 500);
  };

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      centerOnNodes(DISCRETE_ZOOM_LEVELS[0]);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const getClosestZoomIndex = (currentScale: number): number => {
    let minDiff = Infinity;
    let bestIdx = 0;
    const levels = drilledNodeId ? [0.8, 1.0] : DISCRETE_ZOOM_LEVELS;
    levels.forEach((level, idx) => {
      const diff = Math.abs(level - currentScale);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  const animateZoom = (
    newScale: number,
    newPos: { x: number; y: number },
    duration = 450
  ) => {
    targetScaleRef.current = newScale;
    targetPosRef.current = newPos;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    const startScale = scale;
    const startPos = { ...position };
    const startTime = performance.now();

    const loop = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease Out Cubic para animación súper suave y moderna
      const ease = 1 - Math.pow(1 - progress, 3);

      const curScale = startScale + (newScale - startScale) * ease;
      const curX = startPos.x + (newPos.x - startPos.x) * ease;
      const curY = startPos.y + (newPos.y - startPos.y) * ease;

      setViewport({
        scale: curScale,
        position: { x: curX, y: curY },
      });

      if (progress < 1) {
        rafId.current = requestAnimationFrame(loop);
      } else {
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(loop);
  };

  // Dragging
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [activeDragNodeId, setActiveDragNodeId] = useState<string | null>(null);
  const [dragNodeInitialPositions, setDragNodeInitialPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [dragMouseStart, setDragMouseStart] = useState({ x: 0, y: 0 });

  // Marquesina de Selección
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });

  // Guías Magnéticas
  const [alignmentGuides, setAlignmentGuides] = useState<{ x?: number; y?: number }>({});

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || (activeEl as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      const isMac = typeof window !== "undefined" && (window.navigator?.platform || "").toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "Escape") {
        setContextMenu((prev) => ({ ...prev, visible: false }));
        if (useGraphStore.getState().drilledNodeId) {
          useGraphStore.getState().exitDrillDown();
        }
      } else if (modifier && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveToFile();
      } else if (modifier && e.key.toLowerCase() === "z") {
        if (e.shiftKey) redo();
        else undo();
      } else if (modifier && e.key.toLowerCase() === "y") {
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace" || e.key === "Supr") {
        if (selectedConnectionId) {
          deleteConnection(selectedConnectionId);
        } else if (selectedNodeIds.length > 0) {
          deleteSelectedNodes();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, deleteSelectedNodes, deleteConnection, saveToFile, selectedNodeIds, selectedConnectionId]);

  const [fixedParentPos, setFixedParentPos] = useState<{ x: number; y: number } | null>(null);

  // Subárbol de nodos internos para drill-down
  const { internalNodeIds, parentDrilledNode, internalNodes } = useMemo(() => {
    if (!drilledNodeId) {
      return { internalNodeIds: new Set<string>(), parentDrilledNode: null, internalNodes: [] };
    }

    const parent = nodes.find((n) => n.id === drilledNodeId) || null;
    if (!parent) {
      return { internalNodeIds: new Set<string>(), parentDrilledNode: null, internalNodes: [] };
    }

    // Nodos internos conectados que sean de tier/rango jerárquico menor (hijos)
    const ids = getInternalNodeIds(parent, nodes, connections);
    const internals = nodes.filter((n) => ids.has(n.id));

    return { internalNodeIds: ids, parentDrilledNode: parent, internalNodes: internals };
  }, [drilledNodeId, nodes, connections]);

  // Fijar la posición del nodo padre solo al ingresar a la vista interna (no recalcular mientras se arrastran nodos)
  useEffect(() => {
    if (!drilledNodeId) {
      setFixedParentPos(null);
      return;
    }

    const currentNodes = useGraphStore.getState().nodes;
    const currentConns = useGraphStore.getState().connections;
    const parent = currentNodes.find((n) => n.id === drilledNodeId);
    if (!parent) return;

    const ids = getInternalNodeIds(parent, currentNodes, currentConns);
    const internals = currentNodes.filter((n) => ids.has(n.id));

    if (internals.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity;
      internals.forEach((n) => {
        if (n.x < minX) minX = n.x;
        const dims = getBaseNodeDimensions(n);
        if (n.x + dims.width > maxX) maxX = n.x + dims.width;
        if (n.y < minY) minY = n.y;
      });
      const centerX = (minX + maxX) / 2;
      const parentDims = getBaseNodeDimensions(parent);
      setFixedParentPos({
        x: centerX - parentDims.width / 2,
        y: minY - parentDims.height * 0.7 - 60,
      });
    } else {
      setFixedParentPos({ x: parent.x, y: parent.y });
    }
  }, [drilledNodeId]);

  const displayedNodes = useMemo(() => {
    if (!drilledNodeId || !parentDrilledNode) return nodes;

    const parentWithPos = fixedParentPos
      ? { ...parentDrilledNode, x: fixedParentPos.x, y: fixedParentPos.y }
      : parentDrilledNode;

    return [parentWithPos, ...internalNodes];
  }, [drilledNodeId, parentDrilledNode, fixedParentPos, internalNodes, nodes]);

  const externalConnections = useMemo(() => {
    if (!drilledNodeId) return [];
    const internalSet = new Set([drilledNodeId, ...Array.from(internalNodeIds)]);
    return connections.filter((c) => {
      const sIn = internalSet.has(c.source);
      const tIn = internalSet.has(c.target);
      return (sIn && !tIn) || (!sIn && tIn);
    });
  }, [drilledNodeId, internalNodeIds, connections]);

  // Transición suave: centrar el nodo padre arriba en el medio y los nodos internos debajo
  useEffect(() => {
    if (!canvasRef.current) return;

    if (drilledNodeId) {
      prevDrilledRef.current = drilledNodeId;
      const timer = setTimeout(() => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const vw = rect ? rect.width : (typeof window !== "undefined" ? window.innerWidth : 1200);
        const vh = rect ? rect.height : (typeof window !== "undefined" ? window.innerHeight : 800);

        const currentNodes = useGraphStore.getState().nodes;
        const currentConns = useGraphStore.getState().connections;
        const pNode = currentNodes.find((n) => n.id === drilledNodeId);
        if (!pNode) return;

        const ids = getInternalNodeIds(pNode, currentNodes, currentConns);
        const internals = currentNodes.filter((n) => ids.has(n.id));
        const parentDims = getBaseNodeDimensions(pNode);

        if (internals.length === 0) {
          const targetX = vw / 2 - (pNode.x + parentDims.width / 2) * 1.0;
          const targetY = vh / 2 - (pNode.y + parentDims.height / 2) * 1.0;
          animateZoom(1.0, { x: targetX, y: targetY }, 550);
          return;
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity;
        internals.forEach((n) => {
          if (n.x < minX) minX = n.x;
          const dims = getBaseNodeDimensions(n);
          if (n.x + dims.width > maxX) maxX = n.x + dims.width;
          if (n.y < minY) minY = n.y;
        });
        const centerX = (minX + maxX) / 2;
        const pLayoutY = minY - parentDims.height * 0.7 - 60;

        const targetScale = 1.0;
        const visibleCenterX = (vw + 290) / 2;
        const targetX = visibleCenterX - centerX * targetScale;
        const targetY = 70 - pLayoutY * targetScale;

        animateZoom(
          targetScale,
          {
            x: targetX,
            y: targetY,
          },
          550
        );
      }, 30);

      return () => clearTimeout(timer);
    } else if (prevDrilledRef.current) {
      // Regreso suave a la vista general
      const previousId = prevDrilledRef.current;
      prevDrilledRef.current = null;
      const timer = setTimeout(() => {
        const currentNodes = useGraphStore.getState().nodes;
        const targetNode = currentNodes.find((n) => n.id === previousId);
        const rect = canvasRef.current?.getBoundingClientRect();
        const vw = rect ? rect.width : (typeof window !== "undefined" ? window.innerWidth : 1200);
        const vh = rect ? rect.height : (typeof window !== "undefined" ? window.innerHeight : 800);

        if (targetNode) {
          const dims = getBaseNodeDimensions(targetNode);
          const targetScale = DISCRETE_ZOOM_LEVELS[1] || 0.6;
          animateZoom(
            targetScale,
            {
              x: vw / 2 - (targetNode.x + dims.width / 2) * targetScale,
              y: vh / 2 - (targetNode.y + dims.height / 2) * targetScale,
            },
            550
          );
        } else {
          centerOnNodes(DISCRETE_ZOOM_LEVELS[0]);
        }
      }, 30);

      return () => clearTimeout(timer);
    }
  }, [drilledNodeId]);

  const handleContextMenu = (e: React.MouseEvent, targetNodeId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      canvasX: (e.clientX - rect.left - position.x) / scale,
      canvasY: (e.clientY - rect.top - position.y) / scale,
      targetNodeId,
    });

    if (targetNodeId && !selectedNodeIds.includes(targetNodeId)) {
      setSelectedNodeIds([targetNodeId]);
    }
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));

    const target = e.target as HTMLElement;
    if (e.button !== 0 || target.closest(".interactive-node") || target.closest("aside")) return;

    if (e.shiftKey) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - position.x) / scale;
      const canvasY = (e.clientY - rect.top - position.y) / scale;

      setIsMarqueeSelecting(true);
      setMarqueeStart({ x: canvasX, y: canvasY });
      setMarqueeEnd({ x: canvasX, y: canvasY });
    } else {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      targetPosRef.current = { ...position };
      targetScaleRef.current = scale;
      
      setIsCanvasDragging(true);
      setDragMouseStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      setSelectedNodeIds([]);
      closeNodeDetails();
      selectConnection(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    if (e.button !== 0) return;
    e.stopPropagation();

    if (editorMode === "view") {
      setSelectedNodeIds([id]);
      openNodeDetails(id);
      const node = displayedNodes.find((n) => n.id === id) || nodes.find((n) => n.id === id);
      if (node) {
        handleNodeClick(node);
      }
      return;
    }

    recordSnapshot();

    let currentSelected = [...selectedNodeIds];
    if (e.shiftKey) {
      toggleSelectNode(id);
      return;
    } else if (!currentSelected.includes(id)) {
      currentSelected = [id];
      setSelectedNodeIds([id]);
    }
    openNodeDetails(id);

    setActiveDragNodeId(id);
    setDragMouseStart({ x: e.clientX, y: e.clientY });

    const initialPositions = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => {
      if (currentSelected.includes(n.id)) {
        initialPositions.set(n.id, { x: n.x, y: n.y });
      }
    });
    setDragNodeInitialPositions(initialPositions);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectingSourceId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      updateTempMousePos({
        x: (e.clientX - rect.left - position.x) / scale,
        y: (e.clientY - rect.top - position.y) / scale,
      });
      return;
    }

    if (isMarqueeSelecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentCanvasX = (e.clientX - rect.left - position.x) / scale;
      const currentCanvasY = (e.clientY - rect.top - position.y) / scale;
      setMarqueeEnd({ x: currentCanvasX, y: currentCanvasY });

      const x1 = Math.min(marqueeStart.x, currentCanvasX);
      const x2 = Math.max(marqueeStart.x, currentCanvasX);
      const y1 = Math.min(marqueeStart.y, currentCanvasY);
      const y2 = Math.max(marqueeStart.y, currentCanvasY);

      const intersected = nodes
        .filter((n) => n.x >= x1 && n.x <= x2 && n.y >= y1 && n.y <= y2)
        .map((n) => n.id);

      setSelectedNodeIds(intersected);
      return;
    }

    if (isCanvasDragging) {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      const newPos = { x: e.clientX - dragMouseStart.x, y: e.clientY - dragMouseStart.y };
      targetPosRef.current = newPos;
      setPosition(newPos);
    } else if (activeDragNodeId) {
      const dx = (e.clientX - dragMouseStart.x) / scale;
      const dy = (e.clientY - dragMouseStart.y) / scale;

      let guideX: number | undefined;
      let guideY: number | undefined;

      const mainNodePos = dragNodeInitialPositions.get(activeDragNodeId);
      let targetX = (mainNodePos?.x || 0) + dx;
      let targetY = (mainNodePos?.y || 0) + dy;

      if (snapToGrid) {
        targetX = Math.round(targetX / 20) * 20;
        targetY = Math.round(targetY / 20) * 20;
      }

      nodes.forEach((n) => {
        if (!dragNodeInitialPositions.has(n.id)) {
          if (Math.abs(n.x - targetX) < 6) {
            targetX = n.x;
            guideX = n.x;
          }
          if (Math.abs(n.y - targetY) < 6) {
            targetY = n.y;
            guideY = n.y;
          }
        }
      });

      setAlignmentGuides({ x: guideX, y: guideY });

      const finalDx = targetX - (mainNodePos?.x || 0);
      const finalDy = targetY - (mainNodePos?.y || 0);

      const updates: { id: string; x: number; y: number }[] = [];
      dragNodeInitialPositions.forEach((initialPos, nodeId) => {
        updates.push({ id: nodeId, x: initialPos.x + finalDx, y: initialPos.y + finalDy });
      });

      updateMultipleNodes(updates);
    }
  };

  const handleMouseUp = () => {
    setIsCanvasDragging(false);
    setIsMarqueeSelecting(false);
    setActiveDragNodeId(null);
    setAlignmentGuides({});
    if (connectingSourceId) cancelConnecting();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rawType = e.dataTransfer.getData("application/reactflow");
    if (!rawType) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - position.x) / scale;
    const canvasY = (e.clientY - rect.top - position.y) / scale;

    if (rawType === "GROUP") {
      addGroupNode("Módulo Santander", canvasX, canvasY);
    } else {
      recordSnapshot();
      const newId = `node-${Date.now()}`;
      const newNode: CustomNode = {
        id: newId,
        name: `Nuevo ${rawType}`,
        role: "Sin definir",
        type: rawType as NodeType,
        status: "On-hold",
        x: snapToGrid ? Math.round(canvasX / 20) * 20 : canvasX,
        y: snapToGrid ? Math.round(canvasY / 20) * 20 : canvasY,
      };
      useGraphStore.setState((state) => ({ nodes: [...state.nodes, newNode], selectedNodeIds: [newId] }));
    }
  };

  const handleNodeClick = (node: CustomNode) => {
    if (!canvasRef.current || editorMode !== "view") return;

    const dims = getBaseNodeDimensions(node);
    const nodeCenterX = node.x + dims.width / 2;
    const nodeCenterY = node.y + dims.height / 2;

    const tier = NODE_TIERS[node.type] || 3;
    const targetScale = getClickZoomForTier(tier);

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const targetPosX = centerX - nodeCenterX * targetScale;
    const targetPosY = centerY - nodeCenterY * targetScale;

    animateZoom(targetScale, { x: targetPosX, y: targetPosY }, 500);
  };

  const renderNodeView = (node: CustomNode) => {
    const isSelected = selectedNodeIds.includes(node.id);
    const isDrilledParent = drilledNodeId === node.id;
    const isInsideDrill = !!drilledNodeId;
    const opacity = isInsideDrill ? 1.0 : getNodeOpacity(node.type, scale, isSemanticZoomActive);

    if (opacity <= 0.02) return null;

    const props = {
      node,
      isSelected,
      zoomScale: isDrilledParent ? 0.7 : (isInsideDrill ? 1.0 : scale),
      isSemanticZoomActive: !isInsideDrill && isSemanticZoomActive,
      onMouseDown: (e: React.MouseEvent) => handleNodeMouseDown(e, node.id),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, node.id),
    };

    let nodeEl: React.ReactNode = null;

    switch (node.type as string) {
      case "GROUP":
        nodeEl = <GroupNodeView key={node.id} {...props} />;
        break;
      case "PROCESS":
        nodeEl = <ProcessNode key={node.id} {...props} />;
        break;
      case "HUB":
        nodeEl = <CircleNodeView key={node.id} {...props} />;
        break;
      case "DEPARTMENT":
        nodeEl = <DepartmentNodeView key={node.id} {...props} />;
        break;
      case "AREA":
        nodeEl = <AreaNodeView key={node.id} {...props} />;
        break;
      case "HUB2":
        nodeEl = <NodoNivel2 key={node.id} {...props} />;
        break;
      case "AGENT":
        nodeEl = <NodoNivel1 key={node.id} {...props} />;
        break;
      case "TOOL":
        nodeEl = <NodoNivel3 key={node.id} {...props} />;
        break;
      case "WORKER":
        nodeEl = <NodoNivel4 key={node.id} {...props} />;
        break;
      case "TASK":
        nodeEl = <TaskNode key={node.id} {...props} />;
        break;
      case "DECISION":
        nodeEl = <DecisionNode key={node.id} {...props} />;
        break;
      case "SUBPROCESS":
        nodeEl = <SubprocessNode key={node.id} {...props} />;
        break;
      case "KNOWLEDGE_BASE":
        nodeEl = <KnowledgeBaseNode key={node.id} {...props} />;
        break;
      case "ACTION":
        nodeEl = <ActionNode key={node.id} {...props} />;
        break;
      case "RESOURCE":
        nodeEl = <ResourceNode key={node.id} {...props} />;
        break;
      default:
        nodeEl = <TextCardView key={node.id} {...props} />;
        break;
    }

    return (
      <div
        key={node.id}
        data-node-id={node.id}
        onClick={() => handleNodeClick(node)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          const isContainer = ["HUB", "DEPARTMENT", "AREA", "HUB2", "PROCESS", "GROUP", "SUBPROCESS"].includes(node.type);
          if (isContainer) {
            if (drilledNodeId === node.id) {
              exitDrillDown();
            } else {
              enterDrillDown(node.id);
            }
          }
        }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity,
          pointerEvents: opacity > 0.25 ? "auto" : "none",
        }}
      >
        {isDrilledParent && (
          <div
            style={{
              position: "absolute",
              top: `${node.y - 28}px`,
              left: `${node.x + (node.width || 280) / 2}px`,
              transform: "translateX(-50%)",
              backgroundColor: theme === "santander" ? "#EC0000" : "#00f0ff",
              color: theme === "santander" ? "#ffffff" : "#05070f",
              fontSize: "10px",
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: "12px",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            NODO CONTENEDOR EN FOCO
          </div>
        )}
        {nodeEl}
      </div>
    );
  };

  const accentColor = themeConfig.canvas.guideColor;

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!canvasRef.current) return;
    if (Math.abs(e.deltaY) < 5) return;

    const levels = drilledNodeId ? [0.8, 1.0] : DISCRETE_ZOOM_LEVELS;
    const currentIdx = getClosestZoomIndex(targetScaleRef.current);
    const nextIdx = e.deltaY < 0 
      ? Math.min(currentIdx + 1, levels.length - 1)
      : Math.max(currentIdx - 1, 0);

    const newScale = levels[nextIdx];
    if (newScale === targetScaleRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const baseScale = targetScaleRef.current;
    const basePos = targetPosRef.current;

    const canvasX = (mouseX - basePos.x) / baseScale;
    const canvasY = (mouseY - basePos.y) / baseScale;

    const newPosX = mouseX - canvasX * newScale;
    const newPosY = mouseY - canvasY * newScale;

    animateZoom(newScale, { x: newPosX, y: newPosY });
  };

  if (!isMounted) {
    return <div style={{ width: "100%", height: "100%", backgroundColor: themeConfig.canvas.backgroundColor }} />;
  }

  return (
    <div
      ref={canvasRef}
      onContextMenu={(e) => handleContextMenu(e)}
      onWheel={handleWheelZoom}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: themeConfig.canvas.backgroundColor,
        backgroundImage: themeConfig.canvas.backgroundImage,
        backgroundSize: "24px 24px",
        overflow: "hidden",
        display: "flex",
        userSelect: "none",
        cursor: isCanvasDragging ? "grabbing" : "grab",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Botón flotante para salir de Nodos Internos */}
      {drilledNodeId && parentDrilledNode && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "310px",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: theme === "santander" ? "rgba(25, 10, 10, 0.94)" : "rgba(10, 15, 29, 0.94)",
            backdropFilter: "blur(12px)",
            border: theme === "santander" ? "1px solid rgba(236, 0, 0, 0.4)" : "1px solid rgba(0, 240, 255, 0.4)",
            padding: "8px 18px",
            borderRadius: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          <button
            onClick={exitDrillDown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: theme === "santander" ? "#EC0000" : "#00f0ff",
              color: theme === "santander" ? "#ffffff" : "#000000",
              fontWeight: "bold",
              fontSize: "12px",
              border: "none",
              borderRadius: "20px",
              padding: "6px 14px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <ArrowLeft size={14} /> Volver a vista general
          </button>
          <div style={{ width: "1px", height: "18px", backgroundColor: "rgba(255,255,255,0.15)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#f4f4f5" }}>
            <span style={{ color: "#94a3b8" }}>Nivel:</span>
            <span style={{ fontWeight: 600, color: theme === "santander" ? "#EC0000" : "#38bdf8" }}>
              {parentDrilledNode.name}
            </span>
            <span style={{ fontSize: "10px", color: "#71717a", marginLeft: "4px" }}>
              ({internalNodes.length} nodos internos)
            </span>
          </div>
        </div>
      )}

      <NodeInspector />
      <Sidebar />

      <CanvasControls
        scale={scale}
        snapToGrid={snapToGrid}
        isSemanticZoomActive={isSemanticZoomActive}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        onToggleSemanticZoom={() => setIsSemanticZoomActive(!isSemanticZoomActive)}
        onZoomIn={() => {
          const levels = drilledNodeId ? [0.8, 1.0] : DISCRETE_ZOOM_LEVELS;
          const s = targetScaleRef.current;
          const currentIdx = getClosestZoomIndex(s);
          const nextIdx = Math.min(currentIdx + 1, levels.length - 1);
          const next = levels[nextIdx];
          const rect = canvasRef.current?.getBoundingClientRect();
          const centerX = rect ? rect.width / 2 : 500;
          const centerY = rect ? rect.height / 2 : 300;
          const canvasX = (centerX - targetPosRef.current.x) / s;
          const canvasY = (centerY - targetPosRef.current.y) / s;
          animateZoom(next, { x: centerX - canvasX * next, y: centerY - canvasY * next });
        }}
        onZoomOut={() => {
          const levels = drilledNodeId ? [0.8, 1.0] : DISCRETE_ZOOM_LEVELS;
          const s = targetScaleRef.current;
          const currentIdx = getClosestZoomIndex(s);
          const prevIdx = Math.max(currentIdx - 1, 0);
          const prev = levels[prevIdx];
          const rect = canvasRef.current?.getBoundingClientRect();
          const centerX = rect ? rect.width / 2 : 500;
          const centerY = rect ? rect.height / 2 : 300;
          const canvasX = (centerX - targetPosRef.current.x) / s;
          const canvasY = (centerY - targetPosRef.current.y) / s;
          animateZoom(prev, { x: centerX - canvasX * prev, y: centerY - canvasY * prev });
        }}
        onReset={() => centerOnNodes(drilledNodeId ? 1.0 : DISCRETE_ZOOM_LEVELS[0])}
      />

      <MiniMap scale={scale} position={position} onNavigate={(nx, ny) => setPosition({ x: nx, y: ny })} />

      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
        <div
          data-canvas-viewport="true"
          data-canvas-scale={scale}
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            inset: 0,
          }}
        >
          <CanvasConnections
            nodes={displayedNodes}
            selectedNodeId={selectedNodeIds[0] || null}
            scale={scale}
            isSemanticZoomActive={!drilledNodeId && isSemanticZoomActive}
          />

          {displayedNodes.map((node) => renderNodeView(node))}

          {/* Indicadores de conexiones externas cuando se está en vista interna */}
          {drilledNodeId && (
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 15 }}>
              {externalConnections.map((c) => {
                const isSourceInternal = [drilledNodeId, ...Array.from(internalNodeIds)].includes(c.source);
                const internalId = isSourceInternal ? c.source : c.target;
                const externalId = isSourceInternal ? c.target : c.source;
                const intNode = displayedNodes.find((n) => n.id === internalId);
                const extNode = nodes.find((n) => n.id === externalId);
                if (!intNode) return null;

                const intDims = getBaseNodeDimensions(intNode);
                const startX = intNode.x + intDims.width / 2;
                const startY = intNode.y;
                const targetY = startY - 40;

                const rectWidth = 114;
                const rectHeight = 22;
                const rectX = startX - rectWidth / 2;
                const rectY = targetY - rectHeight + 2;

                return (
                  <g key={`ext-${c.id}`} opacity={0.9}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={startX}
                      y2={targetY}
                      stroke={theme === "santander" ? "#EC0000" : "#00f0ff"}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <circle cx={startX} cy={targetY} r={3.5} fill={theme === "santander" ? "#EC0000" : "#00f0ff"} />
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectWidth}
                      height={rectHeight}
                      rx={5}
                      fill={theme === "santander" ? "rgba(40,10,10,0.94)" : "rgba(10,20,35,0.94)"}
                      stroke={theme === "santander" ? "rgba(236,0,0,0.6)" : "rgba(0,240,255,0.6)"}
                      strokeWidth={1}
                    />
                    <text
                      x={startX}
                      y={rectY + 14}
                      fill={theme === "santander" ? "#fca5a5" : "#7dd3fc"}
                      fontSize="9.5px"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      ↗ EXT: {extNode ? extNode.name.slice(0, 11) : "EXTERNO"}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Guías de alineación */}
          {alignmentGuides.x !== undefined && (
            <div style={{ position: "absolute", left: `${alignmentGuides.x}px`, top: "-2000px", bottom: "-2000px", width: "1px", backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}`, zIndex: 30 }} />
          )}
          {alignmentGuides.y !== undefined && (
            <div style={{ position: "absolute", top: `${alignmentGuides.y}px`, left: "-2000px", right: "-2000px", height: "1px", backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}`, zIndex: 30 }} />
          )}

          {/* Marquesina */}
          {isMarqueeSelecting && (
            <div
              style={{
                position: "absolute",
                left: `${Math.min(marqueeStart.x, marqueeEnd.x)}px`,
                top: `${Math.min(marqueeStart.y, marqueeEnd.y)}px`,
                width: `${Math.abs(marqueeEnd.x - marqueeStart.x)}px`,
                height: `${Math.abs(marqueeEnd.y - marqueeStart.y)}px`,
                backgroundColor: themeConfig.canvas.marqueeBg,
                border: `1px dashed ${themeConfig.canvas.marqueeBorder}`,
                borderRadius: "4px",
                pointerEvents: "none",
                zIndex: 35,
              }}
            />
          )}
        </div>
      </div>

      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        onAddNode={(type) => {
          recordSnapshot();
          const newId = `node-${Date.now()}`;
          const newNode: CustomNode = {
            id: newId,
            name: `Nuevo ${type}`,
            role: "Sin definir",
            type,
            status: "On-hold",
            x: contextMenu.canvasX,
            y: contextMenu.canvasY,
          };
          useGraphStore.setState((state) => ({ nodes: [...state.nodes, newNode], selectedNodeIds: [newId] }));
          setContextMenu((prev) => ({ ...prev, visible: false }));
        }}
        onDuplicateNode={(id) => {
          const original = nodes.find((n) => n.id === id);
          if (!original) return;
          recordSnapshot();
          const newId = `node-${Date.now()}`;
          const duplicate = { ...original, id: newId, name: `${original.name} (Copia)`, x: original.x + 30, y: original.y + 30 };
          useGraphStore.setState((state) => ({ nodes: [...state.nodes, duplicate], selectedNodeIds: [newId] }));
          setContextMenu((prev) => ({ ...prev, visible: false }));
        }}
        onDeleteNode={() => {
          deleteSelectedNodes();
          setContextMenu((prev) => ({ ...prev, visible: false }));
        }}
      />
    </div>
  );
}