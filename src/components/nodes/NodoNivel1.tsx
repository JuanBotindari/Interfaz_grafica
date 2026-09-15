"use client";

import { CustomNode } from "@/types";
import { Bot } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";

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
  const { width, height } = getBaseNodeDimensions(node);

  const botIconSize = Math.max(18, Math.round(NODE_TEXT.AGENT.title * 0.75));

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
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: isSelected ? themeConfig.nodes.boxShadowSelected : themeConfig.nodes.boxShadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        color: themeConfig.colors.textPrimary,
        overflow: "visible",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Bot size={botIconSize} color={themeConfig.colors.primary} style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: `${NODE_TEXT.AGENT.title}px`,
          fontWeight: 600,
          color: themeConfig.colors.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {node.name}
        </span>
      </div>

      <div style={{
        fontSize: `${NODE_TEXT.AGENT.subtitle}px`,
        color: themeConfig.colors.textSecondary,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {node.role}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: `${NODE_TEXT.AGENT.meta}px`,
        color: themeConfig.colors.textSecondary,
      }}>
        <span>{node.model || "GPT-4o"}</span>
        <span style={{ color: node.status === "Active" ? "#22c55e" : "#eab308" }}>{node.status}</span>
      </div>
    </div>
  );
}