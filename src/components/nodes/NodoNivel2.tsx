"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";
import { Network } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel2({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.HUB2.width;
  const height = NODE_SIZES.HUB2.height;
  const fontSize = NODE_TEXT.HUB2.title;

  // Color accent: un nivel abajo del primary, más suave
  const accentColor = isSantander ? "#f05050" : "#38bdf8";
  const accentBg = isSantander ? "rgba(236, 0, 0, 0.12)" : "rgba(56, 189, 248, 0.12)";
  const accentBorder = isSantander ? "rgba(236, 0, 0, 0.5)" : "rgba(56, 189, 248, 0.5)";
  const accentGlow = isSantander ? "rgba(236, 0, 0, 0.35)" : "rgba(56, 189, 248, 0.45)";

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
        borderRadius: themeConfig.nodes.hubShape === "circle" ? "50%" : themeConfig.nodes.borderRadius,
        backgroundColor: themeConfig.nodes.bg,
        border: isSelected
          ? `3px solid ${accentColor}`
          : `2px solid ${accentBorder}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        boxShadow: isSelected
          ? `0 0 18px ${accentGlow}, inset 0 0 12px ${accentBg}`
          : `0 4px 14px rgba(0, 0, 0, 0.35), inset 0 0 8px ${accentBg}`,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, box-shadow 0.2s ease, border 0.2s ease",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Anillo decorativo interior */}
      <div
        style={{
          position: "absolute",
          inset: "14px",
          borderRadius: "50%",
          border: `1.5px solid ${accentBorder}`,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      <Network size={54} color={accentColor} style={{ flexShrink: 0 }} />
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