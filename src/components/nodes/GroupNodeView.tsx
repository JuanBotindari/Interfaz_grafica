"use client";

import { CustomNode } from "@/types";
import { Layers } from "lucide-react";
import NodeHandle from "./NodeHandle";

interface GroupNodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function GroupNodeView({
  node,
  isSelected,
  onMouseDown,
  onContextMenu,
}: GroupNodeViewProps) {
  const width = node.width || 480;
  const height = node.height || 320;

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
        backgroundColor: "rgba(168, 85, 247, 0.03)",
        border: `2px dashed ${isSelected ? "#a855f7" : "rgba(168, 85, 247, 0.3)"}`,
        borderRadius: "16px",
        padding: "12px",
        boxSizing: "border-box",
        pointerEvents: "auto",
        boxShadow: isSelected ? "0 0 20px rgba(168, 85, 247, 0.25)" : "none",
        transition: "border 0.2s, box-shadow 0.2s",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#c084fc",
          fontSize: "13px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <Layers size={16} />
        <span>{node.name}</span>
      </div>
    </div>
  );
}