"use client";

import { CustomNode } from "@/types";
import { Workflow } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";

interface GroupNodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function GroupNodeView({
  node,
  isSelected,
  zoomScale = 1,
  isSemanticZoomActive = true,
  onMouseDown,
  onContextMenu,
}: GroupNodeViewProps) {
  const theme = useGraphStore((state) => state.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = node.width || NODE_SIZES.GROUP.width;
  const height = node.height || NODE_SIZES.GROUP.height;

  const headerBg = isSantander
    ? "linear-gradient(135deg, #1F2937, #111827)"
    : "linear-gradient(135deg, #6366F1, #4F46E5)";
  const bodyBg = isSantander
    ? "rgba(249, 250, 251, 0.75)"
    : "rgba(15, 23, 42, 0.75)";
  const borderColor = isSantander
    ? (isSelected ? "#EC0000" : "#D1D5DB")
    : (isSelected ? "#00F0FF" : "#6366F1");
  const shadow = isSantander
    ? (isSelected ? "0 8px 24px rgba(236,0,0,0.2)" : "0 4px 14px rgba(0,0,0,0.06)")
    : (isSelected ? "0 0 20px rgba(0, 240, 255, 0.35)" : "0 4px 20px rgba(0,0,0,0.4)");

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
        backgroundColor: bodyBg,
        border: `2px solid ${borderColor}`,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: shadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 9,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(6px)",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Header bar de Proceso / Grupo */}
      <div
        style={{
          background: headerBg,
          color: "#FFFFFF",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: `${NODE_TEXT.GROUP.title}px`,
          fontWeight: 700,
          letterSpacing: "0.4px",
          borderBottom: `1px solid ${isSantander ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <Workflow size={16} color={isSantander ? "#EC0000" : "#00F0FF"} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.name}
          </span>
        </div>

        <span
          style={{
            fontSize: "9px",
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: "12px",
            backgroundColor: isSantander ? "rgba(236,0,0,0.15)" : "rgba(0,240,255,0.15)",
            color: isSantander ? "#F87171" : "#38BDF8",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          PROCESO
        </span>
      </div>

      {/* Área contenedora principal */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          backgroundImage: isSantander
            ? "radial-gradient(#E5E7EB 1px, transparent 1px)"
            : "radial-gradient(#334155 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}