"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { NODE_TEXT, NODE_CLIPS, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";
import { Network, Layers } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function NodoNivel2({ node, isSelected, zoomScale = 1, isSemanticZoomActive = true, onMouseDown, onContextMenu }: Props) {
  const theme = useGraphStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const { width, height } = getBaseNodeDimensions(node);
  const fontSize = NODE_TEXT.HUB2.title;

  const borderColor = isSantander ? "#EC0000" : "#FF007F";
  const bgColor = isSantander ? "#E5E7EB" : "#0A0F1D";
  const textColor = isSantander ? "#1F2937" : "#FFFFFF";
  const clipPath = NODE_CLIPS.OCTAGON;
  const dropFilter = isSantander ? "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" : "drop-shadow(0 0 8px #FF007F)";

  // Fondo de la etiqueta roja (coherente con Department y Area)
  const tabBg = isSantander ? "#EC0000" : "linear-gradient(135deg, #EF4444, #B91C1C)";

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
        filter: isSelected ? `drop-shadow(0 0 14px ${borderColor})` : dropFilter,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Contenedor exterior (Borde con clip-path) */}
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
        {/* Contenedor interior (Fondo del nodo) */}
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
            gap: "10px",
            padding: "16px",
            position: "relative",
          }}
        >
          {/* Etiqueta roja superior (dentro de la forma) */}
          <div
            style={{
              position: "absolute",
              top: "0%",
              left: "50%",
              transform: "translateX(-50%)",
              background: tabBg,
              color: "#FFFFFF",
              padding: "3px 12px",
              borderRadius: "6px",
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              zIndex: 2,
              whiteSpace: "nowrap",
            }}
          >
            <Layers size={12} color="#FFFFFF" />
            <span>SUB-ÁREA</span>
          </div>

          <Network size={40} color={borderColor} style={{ flexShrink: 0 }} />
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