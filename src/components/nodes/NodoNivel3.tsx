"use client";

import { useState } from "react";
import { CustomNode } from "@/types";

interface NodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel3({
  node,
  isSelected,
  zoomScale,
  onMouseDown,
  onContextMenu,
}: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: "65px",
        height: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        cursor: "grab",
        zIndex: isSelected ? 20 : 6,
        transition: "transform 0.2s ease",
        transform: isSelected ? "scale(1.15)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: `1px solid ${isSelected ? "#f87171" : "#ef4444"}`,
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "#fca5a5",
          fontWeight: "bold",
          boxShadow: isSelected || isHovered ? "0 0 12px rgba(239, 68, 68, 0.8)" : "none",
          transition: "all 0.2s",
        }}
      >
        P
      </div>

      <span style={{ fontSize: "10px", color: isSelected || isHovered ? "#f4f4f5" : "#a1a1aa", userSelect: "none" }}>
        {node.name}
      </span>
    </div>
  );
}