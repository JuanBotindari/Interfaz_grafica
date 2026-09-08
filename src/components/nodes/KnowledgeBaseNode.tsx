"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { Database } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function KnowledgeBaseNode({ node, isSelected, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const accentColor = isSantander ? "#059669" : "#10b981";
  const accentBg = "rgba(16,185,129,0.1)";
  const accentBorder = isSelected ? accentColor : "rgba(16,185,129,0.4)";

  const width = node.width || 180;

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
        height: "90px",
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Cylinder top cap */}
      <div style={{
        width: "100%",
        height: "14px",
        backgroundColor: accentBg,
        border: `${isSelected ? 2 : 1}px solid ${accentBorder}`,
        borderRadius: "50%",
        position: "relative",
        zIndex: 2,
        boxShadow: isSelected ? `0 0 12px rgba(16,185,129,0.4)` : "none",
      }} />

      {/* Cylinder body */}
      <div style={{
        width: "100%",
        backgroundColor: themeConfig.nodes.bg,
        backgroundImage: `linear-gradient(180deg, ${accentBg} 0%, transparent 100%)`,
        border: `${isSelected ? 2 : 1}px solid ${accentBorder}`,
        borderTop: "none",
        borderRadius: "0 0 6px 6px",
        marginTop: "-7px",
        padding: "12px 12px 10px",
        boxShadow: isSelected
          ? `0 0 16px rgba(16,185,129,0.35)`
          : themeConfig.nodes.boxShadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}>
        <Database size={18} color={accentColor} />
        <span style={{
          fontSize: "11px",
          fontWeight: 700,
          color: themeConfig.colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.3,
        }}>
          {node.name}
        </span>
        <span style={{
          fontSize: "9px",
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
