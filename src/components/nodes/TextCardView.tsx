"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";
import { StickyNote } from "lucide-react";

interface NodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function TextCardView({
  node,
  isSelected,
  zoomScale = 1,
  isSemanticZoomActive = true,
  onMouseDown,
  onContextMenu,
}: NodeViewProps) {
  const theme = useGraphStore((s) => s.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.NOTE?.width || 144;
  const height = NODE_SIZES.NOTE?.height || 144;

  const bgColor = isSantander ? "#FEF9C3" : "#1E1B4B";
  const borderColor = isSantander ? (isSelected ? "#EC0000" : "#FDE047") : "#00F0FF";
  const textColor = isSantander ? "#713F12" : "#E0F2FE";
  const shadow = isSantander
    ? (isSelected ? "0 0 12px rgba(236,0,0,0.3)" : "0 4px 10px rgba(0,0,0,0.1)")
    : "0 0 12px rgba(0,240,255,0.4)";

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
        backgroundColor: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: "4px",
        boxShadow: shadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 8,
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: "6px",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Post-it folded corner visual strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          borderWidth: "0 14px 14px 0",
          borderStyle: "solid",
          borderColor: `${isSantander ? "#FDE047" : "#00F0FF"} transparent`,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <StickyNote size={14} color={isSantander ? "#713F12" : "#00F0FF"} />
        <span
          style={{
            fontSize: `${NODE_TEXT.NOTE?.title || 11}px`,
            fontWeight: 700,
            color: textColor,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {node.name}
        </span>
      </div>

      {node.description && (
        <span
          style={{
            fontSize: "10px",
            color: isSantander ? "#A16207" : "#94A3B8",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          } as React.CSSProperties}
        >
          {node.description}
        </span>
      )}
    </div>
  );
}