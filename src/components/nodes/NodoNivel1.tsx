"use client";

import { CustomNode } from "@/types";
import { Bot } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, getNodeScaleForZoom } from "@/config/nodeConfig";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel1({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.AGENT.width;
  const height = NODE_SIZES.AGENT.height;

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
        backgroundColor: themeConfig.nodes.bg,
        border: isSelected ? themeConfig.nodes.borderSelected : themeConfig.nodes.border,
        borderRadius: themeConfig.nodes.borderRadius,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: isSelected ? themeConfig.nodes.boxShadowSelected : themeConfig.nodes.boxShadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        color: themeConfig.colors.textPrimary,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Bot size={18} color={themeConfig.colors.primary} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: themeConfig.colors.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name}
        </span>
      </div>

      <div style={{ fontSize: "10px", color: themeConfig.colors.textSecondary }}>{node.role}</div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: themeConfig.colors.textSecondary }}>
        <span>{node.model || "GPT-4o"}</span>
        <span style={{ color: node.status === "Active" ? "#22c55e" : "#eab308" }}>{node.status}</span>
      </div>
    </div>
  );
}