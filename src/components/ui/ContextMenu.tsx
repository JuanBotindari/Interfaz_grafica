"use client";

import { useEffect, useRef } from "react";
import { ContextMenuState, NodeType } from "@/types";
import { Plus, Wrench, Cpu, Copy, Trash2 } from "lucide-react";

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onAddNode: (type: NodeType) => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
}

export default function ContextMenu({
  state,
  onClose,
  onAddNode,
  onDuplicateNode,
  onDeleteNode,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.visible) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    window.addEventListener("pointerdown", handlePointerDownOutside, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize, true);
    window.addEventListener("blur", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDownOutside, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize, true);
      window.removeEventListener("blur", handleScrollOrResize, true);
    };
  }, [state.visible, onClose]);

  if (!state.visible) return null;

  // Ajustar posición para evitar que el menú se corte en los bordes de la pantalla
  const menuWidth = 170;
  const menuHeight = 150;
  const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

  const posX = Math.min(state.x, screenW - menuWidth - 8);
  const posY = Math.min(state.y, screenH - menuHeight - 8);

  return (
    <>
      {/* Fondo transparente que captura cualquier click o right-click fuera del menú */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          backgroundColor: "transparent",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: `${posY}px`,
          left: `${posX}px`,
          zIndex: 100,
          backgroundColor: "#090d16",
          border: "1px solid #1e293b",
          borderRadius: "6px",
          padding: "4px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
          minWidth: "160px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!state.targetNodeId ? (
          <>
            <div style={{ padding: "4px 8px", fontSize: "9px", color: "#64748b", fontWeight: "bold", letterSpacing: "1px" }}>
              CREAR EN ESTE PUNTO
            </div>
            <button
              onClick={() => onAddNode("AGENT")}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 8px", backgroundColor: "transparent", border: "none", color: "#38bdf8", fontSize: "11px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Plus size={12} /> Nuevo Agente
            </button>
            <button
              onClick={() => onAddNode("TOOL")}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 8px", backgroundColor: "transparent", border: "none", color: "#fca5a5", fontSize: "11px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Wrench size={12} /> Nueva Herramienta
            </button>
            <button
              onClick={() => onAddNode("WORKER")}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 8px", backgroundColor: "transparent", border: "none", color: "#94a3b8", fontSize: "11px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Cpu size={12} /> Nuevo Worker
            </button>
          </>
        ) : (
          <>
            <div style={{ padding: "4px 8px", fontSize: "9px", color: "#06b6d4", fontWeight: "bold", letterSpacing: "1px" }}>
              OPCIONES DE NODO
            </div>
            <button
              onClick={() => onDuplicateNode(state.targetNodeId!)}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 8px", backgroundColor: "transparent", border: "none", color: "#f4f4f5", fontSize: "11px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Copy size={12} /> Duplicar
            </button>
            <button
              onClick={() => onDeleteNode(state.targetNodeId!)}
              style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 8px", backgroundColor: "transparent", border: "none", color: "#ef4444", fontSize: "11px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Trash2 size={12} /> Eliminar
            </button>
          </>
        )}
      </div>
    </>
  );
}