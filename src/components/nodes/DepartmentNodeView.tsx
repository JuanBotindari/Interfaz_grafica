"use client";

import { CustomNode } from "@/types";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_SIZES, NODE_TEXT, getNodeScaleForZoom } from "@/config/nodeConfig";
import { Building2, Sparkles } from "lucide-react";

interface Props {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * DepartmentNodeView — Carpeta contenedora ejecutiva con pestaña superior elegante.
 */
export default function DepartmentNodeView({
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
  const width = NODE_SIZES.DEPARTMENT.width;
  const height = NODE_SIZES.DEPARTMENT.height;
  const fontSize = NODE_TEXT.DEPARTMENT.title;

  const tabBg = isSantander ? "#EC0000" : "linear-gradient(135deg, #8B5CF6, #6366F1)";
  const bodyBg = isSantander ? "#FFFFFF" : "#0F172A";
  const borderColor = isSantander ? (isSelected ? "#EC0000" : "#E5E7EB") : (isSelected ? "#00F0FF" : "#334155");
  const shadow = isSantander
    ? (isSelected ? "0 8px 24px rgba(236,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.06)")
    : (isSelected ? "0 0 20px rgba(0, 240, 255, 0.4)" : "0 4px 20px rgba(0,0,0,0.4)");

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
        zIndex: 10,
        filter: isSelected ? `drop-shadow(0 0 8px ${isSantander ? "#EC0000" : "#00F0FF"})` : undefined,
      }}
    >
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Pestaña de cabecera */}
      <div
        style={{
          width: "230px",
          height: "48px",
          background: tabBg,
          color: "#FFFFFF",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          padding: "0 10px",
          fontSize: "25px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          letterSpacing: "0.6px",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Building2 size={20} color="#FFFFFF" />
        <span>DEPARTAMENTO</span>
      </div>

      {/* Cuerpo principal de la tarjeta */}
      <div
        style={{
          flex: 1,
          backgroundColor: bodyBg,
          border: `2px solid ${borderColor}`,
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          borderTopRightRadius: "10px",
          boxShadow: shadow,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "14px 18px",
          gap: "6px",
          position: "relative",
          backdropFilter: isSantander ? "none" : "blur(8px)",
        }}
      >
        {/* Decoración lateral de acento */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "12px",
            bottom: "12px",
            width: "4px",
            backgroundColor: isSantander ? "#EC0000" : "#00F0FF",
            borderRadius: "0 4px 4px 0",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingLeft: "6px" }}>
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              color: isSantander ? "#111827" : "#F8FAFC",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {node.name}
          </span>
        </div>

        {node.role && (
          <span
            style={{
              fontSize: `${NODE_TEXT.DEPARTMENT.subtitle || 10}px`,
              fontWeight: 500,
              color: isSantander ? "#6B7280" : "#94A3B8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {node.role}
          </span>
        )}
      </div>
    </div>
  );
}

