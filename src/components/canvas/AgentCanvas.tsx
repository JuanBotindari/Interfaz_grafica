"use client";

import { useState, useEffect, useRef } from "react";
import { CustomNode, ContextMenuState, NodeType, getNodeOpacity, NODE_TIERS, DISCRETE_ZOOM_LEVELS } from "@/types";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";

// Componentes UI
import CanvasConnections from "./CanvasConnections";
import ContextMenu from "@/components/ui/ContextMenu";
import NodeInspector from "@/components/ui/NodeInspector";
import CanvasControls from "@/components/ui/CanvasControls";
import ExportImportPanel from "@/components/ui/ExportImportPanel";
import Sidebar from "@/components/ui/Sidebar";
import MiniMap from "@/components/ui/MiniMap";

// Vistas de Nodos
import NodoNivel1 from "@/components/nodes/NodoNivel1";
import NodoNivel2 from "@/components/nodes/NodoNivel2";
import NodoNivel3 from "@/components/nodes/NodoNivel3";
import NodoNivel4 from "@/components/nodes/NodoNivel4";
import { CircleNodeView } from "@/components/nodes/CircleNodeView";
import { TextCardView } from "@/components/nodes/TextCardView";
import { GroupNodeView } from "@/components/nodes/GroupNodeView";
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
  } = useGraphStore();

  const themeConfig = getThemeConfig(theme);

  const [isMounted, setIsMounted] = useState(false);
  const [scale, setScale] = useState<number>(DISCRETE_ZOOM_LEVELS[0]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isSemanticZoomActive, setIsSemanticZoomActive] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animación Suave de Zoom (Lerp + requestAnimationFrame)
  const targetScaleRef = useRef<number>(DISCRETE_ZOOM_LEVELS[0]);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const getClosestZoomIndex = (currentScale: number): number => {
    let minDiff = Infinity;
    let bestIdx = 0;
    DISCRETE_ZOOM_LEVELS.forEach((level, idx) => {
      const diff = Math.abs(level - currentScale);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  const animateZoom = (newScale: number, newPos: { x: number; y: number }) => {
    targetScaleRef.current = newScale;
    targetPosRef.current = newPos;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    const loop = () => {
      let isScaleDone = false;
      let isPosDone = false;
      
      setScale((prevScale) => {
        const nextScale = prevScale + (targetScaleRef.current - prevScale) * 0.18;
        if (Math.abs(targetScaleRef.current - nextScale) < 0.001) {
          isScaleDone = true;
          return targetScaleRef.current;
        }
        return nextScale;
      });

      setPosition((prevPos) => {
        const nextX = prevPos.x + (targetPosRef.current.x - prevPos.x) * 0.18;
        const nextY = prevPos.y + (targetPosRef.current.y - prevPos.y) * 0.18;
        if (Math.abs(targetPosRef.current.x - nextX) < 0.2 && Math.abs(targetPosRef.current.y - nextY) < 0.2) {
          isPosDone = true;
          return targetPosRef.current;
        }
        return { x: nextX, y: nextY };
      });

      if (!isScaleDone || !isPosDone) {
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
      selectConnection(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));

    if (e.button !== 0 || editorMode === "view") return;
    e.stopPropagation();
    recordSnapshot();

    let currentSelected = [...selectedNodeIds];
    if (e.shiftKey) {
      toggleSelectNode(id);
      return;
    } else if (!currentSelected.includes(id)) {
      currentSelected = [id];
      setSelectedNodeIds([id]);
    }

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
        status: "Idle",
        x: snapToGrid ? Math.round(canvasX / 20) * 20 : canvasX,
        y: snapToGrid ? Math.round(canvasY / 20) * 20 : canvasY,
      };
      useGraphStore.setState((state) => ({ nodes: [...state.nodes, newNode], selectedNodeIds: [newId] }));
    }
  };

  const handleNodeClick = (node: CustomNode) => {
    if (!canvasRef.current || editorMode !== "view") return;

    const tier = NODE_TIERS[node.type] || 3;
    let targetScale = scale;

    if (tier === 1) {
      targetScale = 0.75;
    } else if (tier === 2) {
      targetScale = 1.0;
    } else {
      targetScale = 1.25;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const targetPosX = centerX - node.x * targetScale;
    const targetPosY = centerY - node.y * targetScale;

    animateZoom(targetScale, { x: targetPosX, y: targetPosY });
  };

  const renderNodeView = (node: CustomNode) => {
    const isSelected = selectedNodeIds.includes(node.id);
    const opacity = getNodeOpacity(node.type, scale, isSemanticZoomActive);

    if (opacity <= 0.02) return null;

    const props = {
      node,
      isSelected,
      zoomScale: scale,
      onMouseDown: (e: React.MouseEvent) => handleNodeMouseDown(e, node.id),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, node.id),
    };

    let nodeEl: React.ReactNode = null;

    switch (node.type as string) {
      case "GROUP":
      case "PROCESS":
        nodeEl = <GroupNodeView key={node.id} {...props} />;
        break;
      case "HUB":
        nodeEl = <CircleNodeView key={node.id} {...props} />;
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
        onClick={() => handleNodeClick(node)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity,
          pointerEvents: opacity > 0.25 ? "auto" : "none",
        }}
      >
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

    const currentIdx = getClosestZoomIndex(targetScaleRef.current);
    const nextIdx = e.deltaY < 0 
      ? Math.min(currentIdx + 1, DISCRETE_ZOOM_LEVELS.length - 1)
      : Math.max(currentIdx - 1, 0);

    const newScale = DISCRETE_ZOOM_LEVELS[nextIdx];
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
      <NodeInspector />
      <Sidebar />
      <ExportImportPanel />

      <CanvasControls
        scale={scale}
        snapToGrid={snapToGrid}
        isSemanticZoomActive={isSemanticZoomActive}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        onToggleSemanticZoom={() => setIsSemanticZoomActive(!isSemanticZoomActive)}
        onZoomIn={() => {
          const s = targetScaleRef.current;
          const currentIdx = getClosestZoomIndex(s);
          const nextIdx = Math.min(currentIdx + 1, DISCRETE_ZOOM_LEVELS.length - 1);
          const next = DISCRETE_ZOOM_LEVELS[nextIdx];
          const rect = canvasRef.current?.getBoundingClientRect();
          const centerX = rect ? rect.width / 2 : 500;
          const centerY = rect ? rect.height / 2 : 300;
          const canvasX = (centerX - targetPosRef.current.x) / s;
          const canvasY = (centerY - targetPosRef.current.y) / s;
          animateZoom(next, { x: centerX - canvasX * next, y: centerY - canvasY * next });
        }}
        onZoomOut={() => {
          const s = targetScaleRef.current;
          const currentIdx = getClosestZoomIndex(s);
          const prevIdx = Math.max(currentIdx - 1, 0);
          const prev = DISCRETE_ZOOM_LEVELS[prevIdx];
          const rect = canvasRef.current?.getBoundingClientRect();
          const centerX = rect ? rect.width / 2 : 500;
          const centerY = rect ? rect.height / 2 : 300;
          const canvasX = (centerX - targetPosRef.current.x) / s;
          const canvasY = (centerY - targetPosRef.current.y) / s;
          animateZoom(prev, { x: centerX - canvasX * prev, y: centerY - canvasY * prev });
        }}
        onReset={() => animateZoom(DISCRETE_ZOOM_LEVELS[0], { x: 0, y: 0 })}
      />

      <MiniMap scale={scale} position={position} onNavigate={(nx, ny) => setPosition({ x: nx, y: ny })} />

      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            inset: 0,
            // CSS transition removida. Usamos el loop de React con requestAnimationFrame para 60fps constantes.
          }}
        >
          <CanvasConnections
            nodes={nodes}
            selectedNodeId={selectedNodeIds[0] || null}
            scale={scale}
            isSemanticZoomActive={isSemanticZoomActive}
          />

          {nodes.map((node) => renderNodeView(node))}

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
                border: `1px stroke ${themeConfig.canvas.marqueeBorder}`,
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
            status: "Idle",
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