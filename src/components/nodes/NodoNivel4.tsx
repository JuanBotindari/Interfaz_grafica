"use client";

import { CustomNode } from "@/types";
import { Cpu } from "lucide-react";
import NodeHandle from "./NodeHandle";

interface NodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel4({
  node,
  isSelected,
  zoomScale,
  onMouseDown,
  onContextMenu,
}: NodeViewProps) {

  return (
    <div
      className="interactive-node"
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: "130px",
        height: "42px",
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        border: `1px solid ${isSelected ? "#22d3ee" : "rgba(6, 182, 212, 0.4)"}`,
        padding: "3px 6px",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        boxShadow: isSelected ? "0 0 12px rgba(6, 182, 212, 0.6)" : "0 2px 8px rgba(0,0,0,0.5)",
        zIndex: isSelected ? 20 : 5,
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Cpu size={10} color="#22d3ee" />
        <span style={{ fontSize: "8px", color: "#e0f2fe", fontWeight: "bold" }}>{node.name}</span>
      </div>

      <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
        <span style={{ fontSize: "7px", color: "#22c55e" }}>{node.status}</span>
        <span style={{ fontSize: "7px", color: "#06b6d4", fontFamily: "monospace" }}>{node.latency}</span>
      </div>
    </div>
  );
}