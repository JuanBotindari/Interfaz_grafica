"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function DecisionNode({ node, isSelected, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const accentColor = isSantander ? "#f59e0b" : "#f59e0b";
  const accentBg = "rgba(245,158,11,0.12)";
  const accentBorder = isSelected ? "#f59e0b" : "rgba(245,158,11,0.5)";

  // Diamond is 90x90, rotated 45°. Outer container is 90x90.
  const size = 90;

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${size}px`,
        height: `${size}px`,
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

      {/* Diamond shape */}
      <div style={{
        width: `${size * 0.72}px`,
        height: `${size * 0.72}px`,
        backgroundColor: themeConfig.nodes.bg,
        border: `${isSelected ? "2px" : "1.5px"} solid ${accentBorder}`,
        transform: "rotate(45deg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isSelected
          ? `0 0 16px rgba(245,158,11,0.5)`
          : `0 4px 12px rgba(0,0,0,0.3)`,
        backgroundImage: `radial-gradient(circle, ${accentBg} 0%, transparent 80%)`,
        position: "relative",
      }}>
        {/* Inner fill */}
      </div>

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
          fontSize: "9px",
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
