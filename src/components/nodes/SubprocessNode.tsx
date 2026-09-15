"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";
import { GitBranch, Layers } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function SubprocessNode({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const { width, height } = getBaseNodeDimensions(node);

  const borderColor = isSantander ? (isSelected ? "#EC0000" : "#D1D5DB") : (isSelected ? "#00F0FF" : "#3b82f6");
  const accentColor = isSantander ? "#EC0000" : "#38BDF8";
  const bgColor = isSantander ? "#FFFFFF" : "#0F172A";
  const shadow = isSantander
    ? (isSelected ? "0 6px 18px rgba(236,0,0,0.25)" : "0 4px 12px rgba(0,0,0,0.06)")
    : (isSelected ? "0 0 16px rgba(0, 240, 255, 0.35)" : "0 4px 16px rgba(0,0,0,0.4)");

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
        border: `2px solid ${borderColor}`,
        borderRadius: "8px",
        boxShadow: shadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "8px 16px",
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Líneas verticales laterales características de Subproceso UML */}
      <div style={{ position: "absolute", left: "8px", top: 0, bottom: 0, width: "2px", backgroundColor: accentColor, opacity: 0.6 }} />
      <div style={{ position: "absolute", right: "8px", top: 0, bottom: 0, width: "2px", backgroundColor: accentColor, opacity: 0.6 }} />

      <GitBranch size={16} color={accentColor} style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: `${NODE_TEXT.SUBPROCESS.title}px`,
          fontWeight: 700,
          color: isSantander ? "#111827" : "#F8FAFC",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {node.name}
      </span>
    </div>
  );
}

