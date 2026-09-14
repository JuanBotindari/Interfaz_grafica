"use client";

import { CustomNode } from "@/types";
import { Brain } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function CircleNodeView({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.HUB.width;
  const height = NODE_SIZES.HUB.height;
  const fontSize = NODE_TEXT.HUB.title;

  const outerBorderColor = isSantander ? "#EC0000" : "#FF007F";
  const innerRingColor = isSantander ? "#F4F4F6" : "#00F0FF";
  const bgColor = isSantander ? "#FFFFFF" : "#0A0F1D";
  const glow = isSantander ? "0 4px 20px rgba(236,0,0,0.15)" : "0 0 12px #00F0FF";

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
        borderRadius: "50%",
        backgroundColor: innerRingColor,
        border: `3px solid ${outerBorderColor}`,
        padding: "3px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isSelected ? `0 0 25px ${outerBorderColor}` : glow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: bgColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          padding: "16px",
        }}
      >
        <Brain size={64} color={isSantander ? "#EC0000" : "#00F0FF"} />
        <span style={{ fontSize: `${fontSize}px`, fontWeight: 800, color: isSantander ? "#1F2937" : "#FFFFFF", textAlign: "center", padding: "0 24px", lineHeight: 1.2 }}>
          {node.name}
        </span>
        {node.status && (
          <span style={{ fontSize: `${NODE_TEXT.HUB.subtitle}px`, fontWeight: 600, color: "#22c55e" }}>{node.status}</span>
        )}
      </div>
    </div>
  );
}