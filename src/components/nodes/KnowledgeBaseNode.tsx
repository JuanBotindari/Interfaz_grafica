"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";
import { Database } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function KnowledgeBaseNode({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const { width, height } = getBaseNodeDimensions(node);
  const dbIconSize = Math.max(18, Math.round(NODE_TEXT.KNOWLEDGE_BASE.title * 0.75));

  const accentColor = isSantander ? "#059669" : "#10b981";
  const accentBg = "rgba(16,185,129,0.1)";
  const accentBorder = isSelected ? accentColor : "rgba(16,185,129,0.4)";

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
        flexDirection: "column",
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        overflow: "visible",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Cylinder top cap */}
      <div style={{
        width: "100%",
        height: "16px",
        backgroundColor: themeConfig.nodes.bg,
        backgroundImage: `linear-gradient(180deg, ${accentBg} 0%, transparent 100%)`,
        border: `${isSelected ? 2 : 1}px solid ${accentBorder}`,
        borderRadius: "50%",
        position: "relative",
        zIndex: 2,
        boxShadow: isSelected ? `0 0 12px rgba(16,185,129,0.4)` : "none",
        flexShrink: 0,
      }} />

      {/* Cylinder body */}
      <div style={{
        flex: 1,
        width: "100%",
        backgroundColor: themeConfig.nodes.bg,
        backgroundImage: `linear-gradient(180deg, ${accentBg} 0%, transparent 100%)`,
        border: `${isSelected ? 2 : 1}px solid ${accentBorder}`,
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        padding: "10px 12px 10px",
        boxShadow: isSelected
          ? `0 0 16px rgba(16,185,129,0.35)`
          : themeConfig.nodes.boxShadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}>
        <Database size={dbIconSize} color={accentColor} style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: `${NODE_TEXT.KNOWLEDGE_BASE.title}px`,
          fontWeight: 700,
          color: themeConfig.colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.25,
          wordBreak: "break-word",
          maxWidth: "100%",
        }}>
          {node.name}
        </span>
        <span style={{
          fontSize: `${NODE_TEXT.KNOWLEDGE_BASE.subtitle || 10}px`,
          color: accentColor,
          backgroundColor: "rgba(16,185,129,0.15)",
          padding: "2px 8px",
          borderRadius: "10px",
          fontWeight: 600,
        }}>
          Base de Conocimiento
        </span>
      </div>
    </div>
  );
}
