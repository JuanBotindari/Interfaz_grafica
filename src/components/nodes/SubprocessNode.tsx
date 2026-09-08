"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { GitBranch } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function SubprocessNode({ node, isSelected, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const accentColor = isSantander ? "#EC0000" : "#818cf8";
  const accentBg = isSantander ? "rgba(236,0,0,0.06)" : "rgba(129,140,248,0.08)";

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        minWidth: "150px",
        width: "150px",
        minHeight: "50px",
        height: "60px",
        backgroundColor: themeConfig.nodes.bg,
        // Double border effect via outline + border
        border: isSelected
          ? `2px solid ${accentColor}`
          : `1px solid ${isSantander ? "rgba(236,0,0,0.3)" : "rgba(129,140,248,0.4)"}`,
        outline: isSelected
          ? `2px solid ${accentColor}22`
          : `1px solid ${isSantander ? "rgba(236,0,0,0.1)" : "rgba(129,140,248,0.15)"}`,
        outlineOffset: "1px",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: isSelected
          ? `0 0 14px ${isSantander ? "rgba(236,0,0,0.3)" : "rgba(129,140,248,0.35)"}`
          : themeConfig.nodes.boxShadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <div style={{
        padding: "2px 8px",
        backgroundColor: accentBg,
        borderBottom: `1px solid ${isSantander ? "rgba(236,0,0,0.15)" : "rgba(129,140,248,0.2)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <GitBranch size={12} color={accentColor} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.02em" }}>
            Subproceso
          </span>
        </div>
        {node.status && (
          <span style={{ fontSize: "8px", fontWeight: 600, color: "#22c55e", backgroundColor: "rgba(34,197,94,0.12)", padding: "1px 4px", borderRadius: "3px" }}>
            {node.status}
          </span>
        )}
      </div>

      <div style={{ padding: "6px 8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span style={{
          fontSize: "12px",
          fontWeight: 700,
          color: themeConfig.colors.textPrimary,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.2,
          textAlign: "center",
        }}>
          {node.name}
        </span>
      </div>
    </div>
  );
}
