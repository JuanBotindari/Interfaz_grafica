"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_SIZES, NODE_TEXT, NODE_CLIPS, getNodeScaleForZoom } from "@/config/nodeConfig";
import { FileText } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function ResourceNode({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((s) => s.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.RESOURCE.width; // 112
  const height = NODE_SIZES.RESOURCE.height; // 144

  const borderColor = isSantander ? "#9CA3AF" : "#00FF66";
  const foldColor = isSantander ? "#D1D5DB" : "#00FF66";
  const bgColor = isSantander ? "#FFFFFF" : "#0A0F1D";
  const textColor = isSantander ? "#1F2937" : "#FFFFFF";
  const clipPath = NODE_CLIPS.FOLDED_CORNER;
  const dropFilter = isSantander ? "drop-shadow(0 4px 6px rgba(0,0,0,0.08))" : "drop-shadow(0 0 6px #00FF66)";

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
        filter: isSelected ? `drop-shadow(0 0 10px ${foldColor})` : dropFilter,
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
          position: "relative",
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 8px",
            position: "relative",
          }}
        >
          {/* Folded corner triangle effect */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "14px",
              height: "14px",
              backgroundColor: foldColor,
              clipPath: "polygon(0 0, 0 100%, 100% 100%)",
            }}
          />

          <FileText size={22} color={isSantander ? "#EC0000" : "#00FF66"} />
          <span
            style={{
              fontSize: `${NODE_TEXT.RESOURCE.title}px`,
              fontWeight: 700,
              color: textColor,
              textAlign: "center",
              lineHeight: 1.2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            } as React.CSSProperties}
          >
            {node.name}
          </span>
        </div>
      </div>
    </div>
  );
}
