"use client";

import { CustomNode } from "@/types";
import { Cpu } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";

interface NodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel4({
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
  const { width, height } = getBaseNodeDimensions(node);

  const borderColor = isSantander ? (isSelected ? "#EC0000" : "#E5E7EB") : (isSelected ? "#00F0FF" : "rgba(6, 182, 212, 0.4)");
  const bgColor = isSantander ? "#FAFAFA" : "#0A0F1D";
  const textColor = isSantander ? "#374151" : "#E0F2FE";
  const shadow = isSantander
    ? (isSelected ? "0 0 10px rgba(236,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)")
    : (isSelected ? "0 0 12px rgba(6, 182, 212, 0.6)" : "0 2px 8px rgba(0,0,0,0.5)");

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
        border: `1px solid ${borderColor}`,
        padding: "4px 8px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "grab",
        userSelect: "none",
        boxShadow: shadow,
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <Cpu size={14} color={isSantander ? "#EC0000" : "#00F0FF"} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: `${NODE_TEXT.WORKER?.title || 11}px`,
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
  );
}