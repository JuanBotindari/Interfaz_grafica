"use client";

import { Activity, X, Trash2 } from "lucide-react";

interface InspectorDrawerProps {
  selectedNode: {
    id: string;
    type: string;
    name: string;
    data?: {
      status?: string;
      latency?: string;
      logs?: string[];
    };
  } | null;
  onClose: () => void;
  onDeleteNode: (id: string) => void;
}

export default function InspectorDrawer({ selectedNode, onClose, onDeleteNode }: InspectorDrawerProps) {
  if (!selectedNode) return null;

  return (
    <div style={{ 
      position: "absolute",
      top: 0,
      right: 0,
      width: "320px", 
      height: "100%", 
      backgroundColor: "#07090e", 
      borderLeft: "1px solid rgba(255,255,255,0.1)", 
      padding: "20px", 
      display: "flex", 
      flexDirection: "column", 
      gap: "20px", 
      zIndex: 30,
      boxShadow: "-10px 0 25px rgba(0,0,0,0.5)"
    }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={16} color="#06b6d4" />
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#f4f4f5", letterSpacing: "1px" }}>INSPECTOR DE NODO</span>
        </div>
        <button onClick={onClose} style={{ cursor: "pointer", background: "none", border: "none" }}>
          <X size={16} color="#71717a" />
        </button>
      </div>

      {/* Info General */}
      <div>
        <span style={{ fontSize: "9px", color: "#06b6d4", fontWeight: "bold", letterSpacing: "1px" }}>
          // TIPO: {selectedNode.type.toUpperCase()}
        </span>
        <h3 style={{ fontSize: "16px", color: "#f4f4f5", margin: "4px 0 0 0", fontWeight: "bold" }}>
          {selectedNode.name}
        </h3>
      </div>

      {/* Telemetría */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#030407", padding: "10px", borderRadius: "4px", border: "1px solid #1e293b" }}>
          <span style={{ fontSize: "10px", color: "#71717a" }}>ESTADO:</span>
          <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: "bold" }}>
            {selectedNode.data?.status || "Activo"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#030407", padding: "10px", borderRadius: "4px", border: "1px solid #1e293b" }}>
          <span style={{ fontSize: "10px", color: "#71717a" }}>LATENCIA:</span>
          <span style={{ fontSize: "10px", color: "#06b6d4" }}>
            {selectedNode.data?.latency || "2ms"}
          </span>
        </div>
      </div>

      {/* Botón de Eliminación */}
      <button 
        onClick={() => {
          onDeleteNode(selectedNode.id);
          onClose();
        }}
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "10px",
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid #ef4444",
          color: "#fca5a5",
          fontSize: "11px",
          fontWeight: "bold",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}
      >
        <Trash2 size={14} />
        ELIMINAR NODO
      </button>
    </div>
  );
}