"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { FileStack } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function ResourceNode({ node, isSelected, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const accentColor = isSantander ? "#7c3aed" : "#a78bfa";
  const accentBg = "rgba(167,139,250,0.12)";
  const accentBorder = isSelected ? accentColor : "rgba(167,139,250,0.4)";

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: "90px",
        height: "65px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Circle icon badge */}
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: themeConfig.nodes.bg,
        backgroundImage: `radial-gradient(circle, ${accentBg}, transparent)`,
        border: `${isSelected ? "2px" : "1.5px"} solid ${accentBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isSelected
          ? `0 0 14px rgba(167,139,250,0.5)`
          : `0 3px 10px rgba(0,0,0,0.3)`,
        transition: "box-shadow 0.2s ease",
      }}>
        <FileStack size={16} color={accentColor} />
      </div>

      {/* Label */}
      <span style={{
        fontSize: "10px",
        fontWeight: 600,
        color: isSelected ? themeConfig.colors.textPrimary : themeConfig.colors.textSecondary,
        textAlign: "center",
        maxWidth: "80px",
        lineHeight: 1.2,
        wordBreak: "break-word",
        transition: "color 0.2s",
      }}>
        {node.name}
      </span>
    </div>
  );
}
