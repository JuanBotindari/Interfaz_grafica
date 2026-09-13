"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";
import { Building2 } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * DepartmentNodeView — entre Nodo Central (HUB) y Área (AREA) en la jerarquía visual.
 * Círculo intermedio, visible en zoom general junto con HUB y AREA.
 */
export default function DepartmentNodeView({
  node,
  isSelected,
  zoomScale = 1,
  isSemanticZoomActive = true,
  onMouseDown,
  onContextMenu,
}: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const accentColor = isSantander ? "#C40000" : "#8b5cf6";
  const accentBg = isSantander ? "rgba(196, 0, 0, 0.10)" : "rgba(139, 92, 246, 0.10)";
  const accentBorder = isSantander ? "rgba(196, 0, 0, 0.55)" : "rgba(139, 92, 246, 0.55)";
  const accentGlow = isSantander ? "rgba(196, 0, 0, 0.40)" : "rgba(139, 92, 246, 0.45)";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.DEPARTMENT.width;
  const height = NODE_SIZES.DEPARTMENT.height;
  const fontSize = NODE_TEXT.DEPARTMENT.title;

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
        borderRadius: "50%",
        backgroundColor: themeConfig.nodes.bg,
        border: isSelected
          ? `4px solid ${accentColor}`
          : `3px solid ${accentBorder}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        boxShadow: isSelected
          ? `0 0 24px ${accentGlow}, 0 0 50px ${accentBg}, inset 0 0 14px ${accentBg}`
          : `0 5px 18px rgba(0, 0, 0, 0.4), inset 0 0 10px ${accentBg}`,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        transition:
          "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, box-shadow 0.2s ease, border 0.2s ease",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <div
        style={{
          position: "absolute",
          inset: "-6px",
          borderRadius: "50%",
          border: `1.5px solid ${accentBorder}`,
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />

      <Building2 size={48} color={accentColor} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          color: themeConfig.colors.textPrimary,
          textAlign: "center",
          padding: "0 18px",
          lineHeight: 1.2,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {node.name}
      </span>
    </div>
  );
}
