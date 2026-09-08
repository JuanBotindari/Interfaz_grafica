"use client";

import { Plus, Link, Trash2 } from "lucide-react";

interface NodePaletteProps {
  onAddNode: (type: "level1" | "level2" | "level3" | "level4") => void;
  isConnecting: boolean;
  onCancelConnecting: () => void;
}

export default function NodePalette({ onAddNode, isConnecting, onCancelConnecting }: NodePaletteProps) {
  return (
    <div style={{
      position: "absolute",
      top: "16px",
      right: "16px",
      zIndex: 25,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#080b11",
      border: "1px solid #1e293b",
      padding: "6px 12px",
      borderRadius: "8px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.6)"
    }}>
      <span style={{ fontSize: "10px", color: "#71717a", fontWeight: "bold", letterSpacing: "1px" }}>AÑADIR:</span>
      
      <button onClick={() => onAddNode("level1")} style={btnStyle}>+ N1 (Core)</button>
      <button onClick={() => onAddNode("level2")} style={btnStyle}>+ N2 (Agente)</button>
      <button onClick={() => onAddNode("level3")} style={btnStyle}>+ N3 (Tool)</button>
      <button onClick={() => onAddNode("level4")} style={btnStyle}>+ N4 (Worker)</button>

      <div style={{ width: "1px", height: "16px", backgroundColor: "#1e293b", margin: "0 4px" }} />

      {isConnecting ? (
        <button onClick={onCancelConnecting} style={{ ...btnStyle, backgroundColor: "#ef4444", color: "#fff" }}>
          Cancelar Enlace
        </button>
      ) : (
        <span style={{ fontSize: "9px", color: "#06b6d4", fontFamily: "monospace" }}>
          [Haz clic en 2 nodos para enlazar]
        </span>
      )}
    </div>
  );
}

const btnStyle = {
  backgroundColor: "rgba(6, 182, 212, 0.12)",
  border: "1px solid rgba(6, 182, 212, 0.3)",
  color: "#22d3ee",
  fontSize: "10px",
  fontWeight: "bold" as const,
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
};