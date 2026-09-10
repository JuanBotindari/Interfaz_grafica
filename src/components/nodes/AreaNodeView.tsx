"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, NODE_TEXT, MINIMIZED_SCALE } from "@/config/nodeConfig";
import { Map } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * AreaNodeView — Nivel 1 del zoom semántico.
 * Representa un Área de negocio principal, visible en el zoom general (50% y 112.5%).
 * Visualmente es un círculo grande, más prominente que HUB2 (Sub área).
 */
export default function AreaNodeView({
  node,
  isSelected,
  zoomScale = 1,
  onMouseDown,
  onContextMenu,
}: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  // AREA usa los colores primarios del tema, más saturados que HUB2
  const accentColor = isSantander ? "#EC0000" : "#06b6d4";
  const accentBg = isSantander ? "rgba(236, 0, 0, 0.10)" : "rgba(6, 182, 212, 0.10)";
  const accentBorder = isSantander ? "rgba(236, 0, 0, 0.6)" : "rgba(6, 182, 212, 0.6)";
  const accentGlow = isSantander ? "rgba(236, 0, 0, 0.45)" : "rgba(6, 182, 212, 0.5)";

  // El nodo se minimiza cuando el zoom > 0.8 (nivel 2+)
  const isMinimized = zoomScale > 0.8;
  const width = NODE_SIZES.AREA.width;
  const height = NODE_SIZES.AREA.height;
  const fontSize = NODE_TEXT.AREA.title;

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
        transform: isMinimized ? `scale(${MINIMIZED_SCALE})` : "scale(1)",
        transformOrigin: "center center",
        opacity: isMinimized ? 0.7 : 1,
        borderRadius: "50%",
        backgroundColor: themeConfig.nodes.bg,
        border: isSelected
          ? `4px solid ${accentColor}`
          : `3px solid ${accentBorder}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        boxShadow: isSelected
          ? `0 0 28px ${accentGlow}, 0 0 60px ${accentBg}, inset 0 0 16px ${accentBg}`
          : `0 6px 20px rgba(0, 0, 0, 0.4), inset 0 0 10px ${accentBg}`,
        cursor: "grab",
        userSelect: "none",
        zIndex: 11,
        transition:
          "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, box-shadow 0.2s ease, border 0.2s ease",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Anillo decorativo exterior */}
      <div
        style={{
          position: "absolute",
          inset: "-8px",
          borderRadius: "50%",
          border: `1.5px dashed ${accentBorder}`,
          opacity: 0.35,
          pointerEvents: "none",
          animation: isSelected ? "spin 12s linear infinite" : "none",
        }}
      />

      {/* Anillo decorativo interior */}
      <div
        style={{
          position: "absolute",
          inset: "18px",
          borderRadius: "50%",
          border: `1.5px solid ${accentBorder}`,
          opacity: 0.25,
          pointerEvents: "none",
        }}
      />

      <Map size={52} color={accentColor} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          color: themeConfig.colors.textPrimary,
          textAlign: "center",
          padding: "0 20px",
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
