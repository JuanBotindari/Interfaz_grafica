"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { CustomNode, Connection, HandlePosition, getNodeOpacity } from "@/types";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, MINIMIZED_SCALE } from "@/config/nodeConfig";

const MINIMIZED_AREA_SIDE = Math.round(NODE_SIZES.AREA.width * MINIMIZED_SCALE);
const MINIMIZED_DEPARTMENT_SIDE = Math.round(NODE_SIZES.DEPARTMENT.width * MINIMIZED_SCALE);

function getNodeDimensions(node: CustomNode, scale: number = 1) {
  const s = NODE_SIZES;
  switch (node.type as string) {
    case "HUB":
      return s.HUB;
    case "DEPARTMENT":
      return scale > 0.8
        ? { width: MINIMIZED_DEPARTMENT_SIDE, height: MINIMIZED_DEPARTMENT_SIDE }
        : s.DEPARTMENT;
    case "AREA":
    case "HUB2":
      // Above zoom 0.8 the node is rendered scaled down (CSS transform)
      return scale > 0.8
        ? { width: MINIMIZED_AREA_SIDE, height: MINIMIZED_AREA_SIDE }
        : s.AREA;
    case "GROUP":
    case "PROCESS":
      return { width: node.width || s.PROCESS.width, height: node.height || s.PROCESS.height };
    case "SUBPROCESS":
      return s.SUBPROCESS;
    case "AGENT":
      return s.AGENT;
    case "KNOWLEDGE_BASE":
      return { width: node.width || s.KNOWLEDGE_BASE.width, height: s.KNOWLEDGE_BASE.height };
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


function getMinimizedCircleLayout(node: CustomNode, scale: number) {
  const full = getNodeDimensions(node, 1);
  const minimized = getNodeDimensions(node, scale);
  const cx = node.x + full.width / 2;
  const cy = node.y + full.height / 2;
  const half = minimized.width / 2;
  return { cx, cy, half };
}

function getNodeHandlePoint(node: CustomNode, handleSide: HandlePosition, scale: number = 1) {
  const type = node.type as string;
  if ((type === "HUB2" || type === "AREA" || type === "DEPARTMENT") && scale > 0.8) {
    const { cx, cy, half } = getMinimizedCircleLayout(node, scale);
    switch (handleSide) {
      case "top":
        return { x: cx, y: cy - half, side: "top" as HandlePosition };
      case "bottom":
        return { x: cx, y: cy + half, side: "bottom" as HandlePosition };
      case "left":
        return { x: cx - half, y: cy, side: "left" as HandlePosition };
      case "right":
        return { x: cx + half, y: cy, side: "right" as HandlePosition };
    }
  }

  const dim = getNodeDimensions(node, scale);
  switch (handleSide) {
    case "top":
      return { x: node.x + dim.width / 2, y: node.y, side: "top" as HandlePosition };
    case "bottom":
      return { x: node.x + dim.width / 2, y: node.y + dim.height, side: "bottom" as HandlePosition };
    case "left":
      return { x: node.x, y: node.y + dim.height / 2, side: "left" as HandlePosition };
    case "right":
      return { x: node.x + dim.width, y: node.y + dim.height / 2, side: "right" as HandlePosition };
    default:
      return { x: node.x + dim.width / 2, y: node.y + dim.height / 2, side: "right" as HandlePosition };
  }
}

function getBestConnectionPoints(
  sourceNode: CustomNode,
  targetNode: CustomNode,
  scale: number = 1,
  fixedSourceHandle?: HandlePosition,
  fixedTargetHandle?: HandlePosition
) {
  const sides: HandlePosition[] = ["top", "bottom", "left", "right"];
  const allSourceHandles = sides.map((s) => getNodeHandlePoint(sourceNode, s, scale));
  const allTargetHandles = sides.map((s) => getNodeHandlePoint(targetNode, s, scale));

  const sourceHandles = fixedSourceHandle
    ? allSourceHandles.filter((h) => h.side === fixedSourceHandle)
    : allSourceHandles;

  const targetHandles = fixedTargetHandle
    ? allTargetHandles.filter((h) => h.side === fixedTargetHandle)
    : allTargetHandles;

  let minDistance = Infinity;
  let bestPair = {
    x1: (sourceHandles[0] || allSourceHandles[3]).x,
    y1: (sourceHandles[0] || allSourceHandles[3]).y,
    side1: (sourceHandles[0] || allSourceHandles[3]).side,
    x2: (targetHandles[0] || allTargetHandles[2]).x,
    y2: (targetHandles[0] || allTargetHandles[2]).y,
    side2: (targetHandles[0] || allTargetHandles[2]).side,
  };

  for (const h1 of sourceHandles) {
    for (const h2 of targetHandles) {
      const dist = Math.hypot(h2.x - h1.x, h2.y - h1.y);
      if (dist < minDistance) {
        minDistance = dist;
        bestPair = { x1: h1.x, y1: h1.y, side1: h1.side, x2: h2.x, y2: h2.y, side2: h2.side };
      }
    }
  }

  return bestPair;
}

function getConnectionPoints(sourceNode: CustomNode, targetNode: CustomNode, connection: Connection, scale: number = 1) {
  if (connection.sourceHandle && connection.targetHandle) {
    const sPt = getNodeHandlePoint(sourceNode, connection.sourceHandle, scale);
    const tPt = getNodeHandlePoint(targetNode, connection.targetHandle, scale);
    return {
      x1: sPt.x,
      y1: sPt.y,
      side1: sPt.side,
      x2: tPt.x,
      y2: tPt.y,
      side2: tPt.side,
    };
  }

  return getBestConnectionPoints(sourceNode, targetNode, scale, connection.sourceHandle, connection.targetHandle);
}

function createBezierPath(x1: number, y1: number, side1: string, x2: number, y2: number, side2: string) {
  let cp1x = x1;
  let cp1y = y1;
  let cp2x = x2;
  let cp2y = y2;

  const dx = Math.max(Math.abs(x2 - x1) * 0.4, 30);
  const dy = Math.max(Math.abs(y2 - y1) * 0.4, 30);

  if (side1 === "right") cp1x += dx;
  else if (side1 === "left") cp1x -= dx;
  else if (side1 === "bottom") cp1y += dy;
  else if (side1 === "top") cp1y -= dy;

  if (side2 === "right") cp2x += dx;
  else if (side2 === "left") cp2x -= dx;
  else if (side2 === "bottom") cp2y += dy;
  else if (side2 === "top") cp2y -= dy;

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}


interface CanvasConnectionsProps {
  nodes: CustomNode[];
  selectedNodeId: string | null;
  scale?: number;
  isSemanticZoomActive?: boolean;
}

export default function CanvasConnections({
  nodes,
  selectedNodeId,
  scale = 1,
  isSemanticZoomActive = true,
}: CanvasConnectionsProps) {
  const { connections, isSimulating, theme, selectConnection, selectedConnectionId, connectingSourceId, connectingSourceHandle, tempMousePos } = useGraphStore();

  const themeConfig = getThemeConfig(theme);

  // Colores según el tema
  const dataColor = themeConfig.connections.data;
  const controlColor = themeConfig.connections.control;

  const connectingSourceNode = connectingSourceId ? nodes.find((n) => n.id === connectingSourceId) : null;

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 2 }}>
      <defs>
        <marker id="arrow-data" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={dataColor} />
        </marker>
        <marker id="arrow-control" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={controlColor} />
        </marker>
      </defs>

      {connections.map((c) => {
        const sourceNode = nodes.find((n) => n.id === c.source);
        const targetNode = nodes.find((n) => n.id === c.target);

        if (!sourceNode || !targetNode) return null;

        const sourceOpacity = getNodeOpacity(sourceNode.type, scale, isSemanticZoomActive);
        const targetOpacity = getNodeOpacity(targetNode.type, scale, isSemanticZoomActive);
        const lineOpacity = Math.min(sourceOpacity, targetOpacity);

        if (lineOpacity <= 0.05) return null;

        const { x1, y1, side1, x2, y2, side2 } = getConnectionPoints(sourceNode, targetNode, c, scale);
        const pathData = createBezierPath(x1, y1, side1, x2, y2, side2);

        const isData = c.type === "data";
        const strokeColor = isData ? dataColor : controlColor;
        const isSelected = selectedConnectionId === c.id;

        return (
          <g
            key={c.id}
            style={{
              pointerEvents: lineOpacity > 0.3 ? "stroke" : "none",
              cursor: "pointer",
              opacity: lineOpacity,
              transition: "opacity 0.35s ease",
            }}
            onClick={() => selectConnection(c.id)}
          >
            {/* Halo de selección */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? themeConfig.connections.selectionHalo : "transparent"}
              strokeWidth={12}
            />

            {/* Línea Principal */}
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray={isSimulating ? "6, 6" : "none"}
              style={{
                animation: isSimulating ? "dash 1s linear infinite" : "none",
                filter: themeConfig.connections.glowEffect ? `drop-shadow(0 0 6px ${strokeColor})` : "none",
              }}
              markerEnd={isData ? "url(#arrow-data)" : "url(#arrow-control)"}
            />
          </g>
        );
      })}

      {/* Línea de conexión temporal al arrastrar el conector */}
      {connectingSourceNode && tempMousePos && (() => {
        const sourcePt = connectingSourceHandle
          ? getNodeHandlePoint(connectingSourceNode, connectingSourceHandle, scale)
          : null;

        const sDim = getNodeDimensions(connectingSourceNode, scale);
        const startX = sourcePt ? sourcePt.x : connectingSourceNode.x + sDim.width / 2;
        const startY = sourcePt ? sourcePt.y : connectingSourceNode.y + sDim.height / 2;
        const startSide = sourcePt ? sourcePt.side : "right";

        const tempPath = createBezierPath(startX, startY, startSide, tempMousePos.x, tempMousePos.y, "left");
        return (
          <path
            d={tempPath}
            fill="none"
            stroke={dataColor}
            strokeWidth={2}
            strokeDasharray="4,4"
          />
        );
      })()}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}</style>
    </svg>
  );
}