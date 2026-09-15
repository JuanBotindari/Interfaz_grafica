"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_TEXT, NODE_CLIPS, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";
import { Wrench } from "lucide-react";

interface NodeViewProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel3({
  node,
  isSelected,
  zoomScale = 1,
  isSemanticZoomActive = true,
  onMouseDown,
  onContextMenu,
}: NodeViewProps) {
  const theme = useGraphStore((state) => state.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const { width, height } = getBaseNodeDimensions(node);

  const borderColor = isSantander ? "#374151" : "#00F0FF";
  const bgColor = isSantander ? "#F3F4F6" : "#0A0F1D";
  const textColor = isSantander ? "#1F2937" : "#FFFFFF";
  const clipPath = NODE_CLIPS.CHAMFERED;
  const dropFilter = isSantander ? "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" : "drop-shadow(0 0 6px #00F0FF)";

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
        filter: isSelected ? `drop-shadow(0 0 8px ${borderColor})` : dropFilter,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Outer border container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          clipPath,
          backgroundColor: borderColor,
          padding: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            clipPath,
            backgroundColor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "0 10px",
          }}
        >
          <Wrench size={14} color={isSantander ? "#EC0000" : "#00F0FF"} style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: `${NODE_TEXT.TOOL.title}px`,
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
      </div>
    </div>
  );
}