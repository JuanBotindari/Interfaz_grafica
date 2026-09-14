"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";
import { Map, Sparkles } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * AreaNodeView — Marco Punteado de Agrupación (Dashed Frame).
 */
export default function AreaNodeView({
  node,
  isSelected,
  zoomScale = 1,
  isSemanticZoomActive = true,
  onMouseDown,
  onContextMenu,
}: Props) {
  const theme = useGraphStore((state) => state.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const width = NODE_SIZES.AREA.width;
  const height = NODE_SIZES.AREA.height;
  const fontSize = NODE_TEXT.AREA.title;

  const borderColor = isSantander ? "#EC0000" : "#00FF66";
  const bgColor = isSantander ? "#FAFAFA" : "rgba(10, 15, 29, 0.4)";
  const textColor = isSantander ? "#1F2937" : "#FFFFFF";
  const shadow = isSantander
    ? (isSelected ? "0 0 16px rgba(236,0,0,0.3)" : "none")
    : (isSelected ? "0 0 20px rgba(0,255,102,0.4), inset 0 0 15px rgba(0, 255, 102, 0.2)" : "inset 0 0 15px rgba(0, 255, 102, 0.1)");

  const tabBg = isSantander ? "#EC0000" : "linear-gradient(135deg, #00FF66, #00CC52)";

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
        display: "flex",
        flexDirection: "column",
        cursor: "grab",
        userSelect: "none",
        zIndex: 11,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Pestaña de cabecera */}
      <div
        style={{
          width: "160px",
          height: "40px",
          background: tabBg,
          color: "#FFFFFF",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          padding: "0 10px",
          fontSize: "22px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          letterSpacing: "0.6px",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Map size={28} color="#FFFFFF" />
        <span>ÁREA</span>
      </div>

      {/* Cuerpo principal (marco punteado) */}
      <div
        style={{
          flex: 1,
          borderRadius: "12px",
          borderTopLeftRadius: 0,
          border: `2px dashed ${borderColor}`,
          backgroundColor: bgColor,
          boxShadow: shadow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "16px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              color: textColor,
              textAlign: "center",
              lineHeight: 1.2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
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