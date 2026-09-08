"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { CheckSquare } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function TaskNode({ node, isSelected, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const headerColor = isSantander ? "#EC0000" : "#6366f1";
  const headerBg = isSantander ? "rgba(236,0,0,0.12)" : "rgba(99,102,241,0.15)";

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: "160px",
        height: "70px",
        backgroundColor: themeConfig.nodes.bg,
        border: isSelected ? `2px solid ${headerColor}` : `1px solid ${themeConfig.nodes.border}`,
        borderRadius: themeConfig.nodes.borderRadius,
        overflow: "hidden",
        boxShadow: isSelected ? `0 0 16px rgba(99,102,241,0.4)` : themeConfig.nodes.boxShadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Header strip */}
      <div style={{
        backgroundColor: headerBg,
        borderBottom: `2px solid ${headerColor}`,
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <CheckSquare size={12} color={headerColor} />
        <span style={{ fontSize: "9px", fontWeight: 700, color: headerColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Tarea
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 10px" }}>
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          color: themeConfig.colors.textPrimary,
          display: "block",
          lineHeight: 1.3,
        }}>
          {node.name}
        </span>
        {node.role && node.role !== "Sin definir" && (
          <span style={{ fontSize: "9px", color: themeConfig.colors.textSecondary, marginTop: "3px", display: "block" }}>
            {node.role}
          </span>
        )}
      </div>
    </div>
  );
}
