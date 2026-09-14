"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";
import { CheckSquare } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function TaskNode({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.TASK.width;
  const height = NODE_SIZES.TASK.height;

  const borderColor = isSantander ? (isSelected ? "#EC0000" : "#D1D5DB") : "#00F0FF";
  const bgColor = isSantander ? "#FFFFFF" : "#0F172A";
  const textColor = isSantander ? "#1F2937" : "#FFFFFF";
  const shadow = isSantander
    ? (isSelected ? "0 0 12px rgba(236,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.05)")
    : (isSelected ? "0 0 12px #00F0FF" : "none");

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
        borderRadius: "8px",
        boxShadow: shadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        padding: "12px",
        gap: "8px",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <CheckSquare size={16} color={isSantander ? "#EC0000" : "#00F0FF"} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: `${NODE_TEXT.TASK.title}px`,
          fontWeight: 600,
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
