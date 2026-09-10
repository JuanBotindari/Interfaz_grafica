"use client";

import { CustomNode } from "@/types";
import { Brain } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, NODE_TEXT } from "@/config/nodeConfig";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function CircleNodeView({ node, isSelected, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);

  const width = NODE_SIZES.HUB.width;
  const height = NODE_SIZES.HUB.height;
  const fontSize = NODE_TEXT.HUB.title;

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
        borderRadius: themeConfig.nodes.hubShape === "circle" ? "50%" : themeConfig.nodes.borderRadius,
        backgroundColor: themeConfig.nodes.bg,
        border: isSelected
          ? `4px solid ${themeConfig.nodes.borderSelected.split(" ")[2] || "#00f0ff"}`
          : `3px solid ${themeConfig.nodes.border.split(" ")[2] || "#333"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        boxShadow: isSelected ? themeConfig.nodes.boxShadowSelected : themeConfig.nodes.boxShadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <Brain size={64} color={themeConfig.colors.primary} />
      <span style={{ fontSize: `${fontSize}px`, fontWeight: 800, color: themeConfig.colors.textPrimary, textAlign: "center", padding: "0 24px", lineHeight: 1.2 }}>
        {node.name}
      </span>
      <span style={{ fontSize: `${NODE_TEXT.HUB.subtitle}px`, fontWeight: 600, color: "#22c55e" }}>{node.status}</span>
    </div>
  );
}