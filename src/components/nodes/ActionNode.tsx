"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";
import { Zap } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function ActionNode({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const { width, height } = getBaseNodeDimensions(node);

  const accentColor = isSantander ? "#d97706" : "#fb923c";
  const accentBg = isSantander ? "rgba(217,119,6,0.12)" : "rgba(251,146,60,0.12)";
  const accentBorder = isSelected ? accentColor : isSantander ? "rgba(217,119,6,0.45)" : "rgba(251,146,60,0.45)";

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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "4px 8px",
        backgroundColor: themeConfig.nodes.bg,
        backgroundImage: `linear-gradient(135deg, ${accentBg}, transparent)`,
        border: `${isSelected ? 2 : 1}px solid ${accentBorder}`,
        borderRadius: "20px",          // pill shape
        boxShadow: isSelected
          ? `0 0 14px ${isSantander ? "rgba(217,119,6,0.45)" : "rgba(251,146,60,0.45)"}`
          : themeConfig.nodes.boxShadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <Zap size={13} color={accentColor} style={{ flexShrink: 0 }} />
      <span style={{
        fontSize: `${NODE_TEXT.ACTION.title}px`,
        fontWeight: 700,
        color: themeConfig.colors.textPrimary,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {node.name}
      </span>
    </div>
  );
}
