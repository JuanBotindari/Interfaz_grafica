"use client";

import { CustomNode } from "@/types";
import { Workflow } from "lucide-react";
import NodeHandle from "./NodeHandle";
import { useGraphStore } from "@/store/useGraphStore";
import { NODE_TEXT, getNodeScaleForZoom, getBaseNodeDimensions } from "@/config/nodeConfig";

interface ProcessNodeProps {
  node: CustomNode;
  isSelected: boolean;
  zoomScale?: number;
  isSemanticZoomActive?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function ProcessNode({
  node,
  isSelected,
  zoomScale = 1,
  isSemanticZoomActive = true,
  onMouseDown,
  onContextMenu,
}: ProcessNodeProps) {
  const theme = useGraphStore((state) => state.theme);
  const isSantander = theme === "santander";

  const scaleFactor = getNodeScaleForZoom(node.type, zoomScale, isSemanticZoomActive);
  const { width, height } = getBaseNodeDimensions(node);

  // Paleta de colores solicitada por el usuario (mantenemos exactamente los tonos favoritos)
  const headerBg = isSantander
    ? "linear-gradient(135deg, #1F2937, #111827)"
    : "linear-gradient(135deg, #6366F1, #4F46E5)";
  const bodyBg = isSantander ? "#FFFFFF" : "rgba(15, 23, 42, 0.9)";
  const borderColor = isSantander
    ? (isSelected ? "#EC0000" : "#D1D5DB")
    : (isSelected ? "#00F0FF" : "#6366F1");
  const shadow = isSantander
    ? (isSelected ? "0 8px 24px rgba(236, 0, 0, 0.25)" : "0 4px 14px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)")
    : (isSelected ? "0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.15)" : "0 4px 20px rgba(0, 0, 0, 0.4)");

  const accentColor = isSantander ? "#E11D48" : "#818CF8";
  const badgeBg = "rgba(255, 255, 255, 0.1)";
  const badgeBorder = "rgba(255, 255, 255, 0.2)";
  const badgeColor = "#F1F5F9";
  const textColor = isSantander ? "#111827" : "#F8FAFC";
  const subtitleColor = isSantander ? "#6B7280" : "#94A3B8";

  // Indicador de estado
  const statusColor = node.status === "Active"
    ? (isSantander ? "#10B981" : "#00FF66")
    : node.status === "On-hold"
    ? "#F59E0B"
    : node.status === "Error"
    ? "#EF4444"
    : (isSantander ? "#9CA3AF" : "#64748B");

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
        borderRadius: "10px",
        boxShadow: shadow,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        overflow: "visible", // Permite que los handles fuera del borde no se corten
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Conectores / Handles accesibles 100% */}
      <NodeHandle nodeId={node.id} position="top" />
      <NodeHandle nodeId={node.id} position="bottom" />
      <NodeHandle nodeId={node.id} position="left" />
      <NodeHandle nodeId={node.id} position="right" />

      {/* Contenedor interno para respetar esquinas redondeadas */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cabecera compacta con Icono y Tag Proceso */}
        <div
          style={{
            height: "26px",
            minHeight: "26px",
            background: headerBg,
            padding: "0 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isSantander ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 240, 255, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Workflow size={13} color={accentColor} style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: badgeColor,
                letterSpacing: "0.3px",
              }}
            >
              Proceso
            </span>
          </div>

          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              boxShadow: `0 0 5px ${statusColor}`,
            }}
            title={`Estado: ${node.status || "On-hold"}`}
          />
        </div>

        {/* Cuerpo con el nombre a ancho completo (sin cortes) */}
        <div
          style={{
            flex: 1,
            backgroundColor: bodyBg,
            backdropFilter: isSantander ? undefined : "blur(8px)",
            padding: "6px 12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            overflow: "hidden",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: `${NODE_TEXT.PROCESS.title}px`,
              fontWeight: 700,
              color: textColor,
              lineHeight: 1.25,
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              maxWidth: "100%",
            }}
            title={node.name}
          >
            {node.name}
          </span>

          {node.role && node.role !== "Sin definir" && (
            <span
              style={{
                fontSize: `${NODE_TEXT.PROCESS.subtitle}px`,
                color: subtitleColor,
                lineHeight: 1.2,
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
    </div>
  );
}
