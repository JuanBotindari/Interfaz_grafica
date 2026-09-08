"use client";

import { CustomNode } from "@/types";
import { Wrench, Cpu } from "lucide-react";

interface NodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function TextCardView({
  node,
  isSelected,
  zoomScale,
  onMouseDown,
  onContextMenu,
}: NodeViewProps) {
  if (zoomScale < 0.4) return null;

  const isTool = node.type === "TOOL";

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        border: `1px solid ${isSelected ? "#22d3ee" : isTool ? "rgba(239, 68, 68, 0.5)" : "rgba(148, 163, 184, 0.3)"}`,
        padding: "6px 10px",
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        cursor: "grab",
        zIndex: isSelected ? 20 : 5,
        boxShadow: isSelected ? "0 0 12px rgba(6, 182, 212, 0.4)" : "0 4px 12px rgba(0,0,0,0.5)",
        minWidth: "120px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {isTool ? <Wrench size={12} color="#fca5a5" /> : <Cpu size={12} color="#94a3b8" />}
        <span style={{ fontSize: "10px", color: "#f4f4f5", fontWeight: "bold" }}>{node.name}</span>
      </div>

      <span style={{ fontSize: "8px", color: "#94a3b8" }}>{node.role}</span>

      {zoomScale >= 0.9 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
          <span style={{ fontSize: "7px", color: "#22c55e" }}>{node.status}</span>
          <span style={{ fontSize: "7px", color: "#06b6d4", fontFamily: "monospace" }}>{node.latency}</span>
        </div>
      )}
    </div>
  );
}