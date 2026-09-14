"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { CustomNode, Connection, HandlePosition, getNodeOpacity } from "@/types";
import { getThemeConfig } from "@/config/themes";
import { getNodeConnectionPoint } from "@/config/nodeConfig";

function getNodeHandlePoint(node: CustomNode, handleSide: HandlePosition, scale: number = 1) {
  return getNodeConnectionPoint(node, handleSide, scale, true);
}

function getBestConnectionPoints(
  sourceNode: CustomNode,
  targetNode: CustomNode,
  scale: number = 1,
  fixedSourceHandle?: HandlePosition,
  fixedTargetHandle?: HandlePosition
) {
  const sides: HandlePosition[] = ["top", "bottom", "left", "right"];

  const sourceHandles = (fixedSourceHandle ? [fixedSourceHandle] : sides).map((s) =>
    getNodeHandlePoint(sourceNode, s, scale)
  );
  const targetHandles = (fixedTargetHandle ? [fixedTargetHandle] : sides).map((s) =>
    getNodeHandlePoint(targetNode, s, scale)
  );

  let minDistance = Infinity;
  let bestPair = {
    x1: sourceHandles[0].x,
    y1: sourceHandles[0].y,
    side1: sourceHandles[0].side,
    x2: targetHandles[0].x,
    y2: targetHandles[0].y,
    side2: targetHandles[0].side,
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

        const startX = sourcePt ? sourcePt.x : connectingSourceNode.x;
        const startY = sourcePt ? sourcePt.y : connectingSourceNode.y;
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