"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function DecisionNode({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const accentColor = isSantander ? "#835608ff" : "#f59e0b";
  const accentBg = "rgba(245,158,11,0.12)";
  const accentBorder = isSelected ? "#f59e0b" : "rgba(245,158,11,0.5)";

  const { width, height } = getBaseNodeDimensions(node);

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${scaleFactor})`,
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* SVG Diamond Shape for perfect borders at any ratio (e.g. 200x100) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <polygon
          points={`${width / 2},1 1,${height / 2} ${width / 2},${height - 1} ${width - 1},${height / 2}`}
          fill={themeConfig.nodes.bg}
          stroke={accentBorder}
          strokeWidth={isSelected ? 2 : 1.5}
        />
      </svg>

      {/* Text centered over the diamond, counter-rotated */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        pointerEvents: "none",
      }}>
        <span style={{
          fontSize: `${NODE_TEXT.DECISION.title}px`,
          fontWeight: 700,
          color: accentColor,
          textAlign: "center",
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}>
          {node.name}
        </span>
      </div>
    </div>
  );
}
