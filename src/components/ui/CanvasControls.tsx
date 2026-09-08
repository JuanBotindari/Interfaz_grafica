"use client";

import React from "react";
import { useGraphStore } from "@/store/useGraphStore";
import { Plus, Minus, RotateCcw, Play, Square, Undo2, Redo2, Wand2, Grid, Sun, Moon, FolderDown, Trash2, Layers } from "lucide-react";

interface CanvasControlsProps {
  scale: number;
  snapToGrid: boolean;
  isSemanticZoomActive?: boolean;
  onToggleSnap: () => void;
  onToggleSemanticZoom?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function CanvasControls({
  scale,
  snapToGrid,
  isSemanticZoomActive = true,
  onToggleSnap,
  onToggleSemanticZoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: CanvasControlsProps) {
  const theme = useGraphStore((state) => state.theme);
  const isSimulating = useGraphStore((state) => state.isSimulating);
  const toggleSimulation = useGraphStore((state) => state.toggleSimulation);
  const past = useGraphStore((state) => state.past);
  const future = useGraphStore((state) => state.future);
  const undo = useGraphStore((state) => state.undo);
  const redo = useGraphStore((state) => state.redo);
  const runAutoLayout = useGraphStore((state) => state.runAutoLayout);

  const isSantander = theme === "santander";

  const handleThemeToggle = () => {
    const { theme: currentTheme, setTheme } = useGraphStore.getState();
    if (typeof setTheme === "function") {
      setTheme(currentTheme === "santander" ? "neon" : "santander");
    }
  };

  // 🚀 FUNCIÓN PARA CARGAR EL JSON BAJO DEMANDA
  const handleLoadPreset = async () => {
    try {
      const res = await fetch("/presets/santander-default.json");
      if (!res.ok) throw new Error("No se encontró el archivo de la plantilla.");
      
      const jsonText = await res.text();
      const success = useGraphStore.getState().importGraphFromJson(jsonText);
      
      if (!success) {
        alert("El archivo JSON no tiene una estructura válida.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al cargar /presets/santander-default.json");
    }
  };

  // 🧹 FUNCIÓN PARA VOLVER A DEJAR EL CANVAS VACÍO
  const handleClearCanvas = () => {
    useGraphStore.setState({ nodes: [], connections: [], selectedNodeIds: [] });
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "24px",
        right: "24px",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: isSantander ? "rgba(255, 255, 255, 0.95)" : "rgba(10, 15, 29, 0.9)",
        border: `1px solid ${isSantander ? "rgba(236, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.12)"}`,
        borderRadius: "10px",
        padding: "6px 10px",
        backdropFilter: "blur(12px)",
        boxShadow: isSantander ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "0 8px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Conmutador de Tema Santander / Neon */}
      <button
        onClick={handleThemeToggle}
        style={{
          ...btnStyle,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 8px",
          backgroundColor: isSantander ? "#EC0000" : "rgba(0, 240, 255, 0.15)",
          color: isSantander ? "#FFFFFF" : "#00f0ff",
          borderRadius: "6px",
          fontWeight: 700,
          fontSize: "11px",
        }}
        title="Cambiar entre Neon Mode y Santander Mode"
      >
        {isSantander ? <Sun size={13} color="#FFF" /> : <Moon size={13} color="#00f0ff" />}
        <span>{isSantander ? "Santander Mode" : "Neon Mode"}</span>
      </button>

      <div style={{ width: "1px", height: "18px", backgroundColor: isSantander ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)" }} />

      {/* 📥 BOTÓN PARA CARGAR PLANTILLA DESDE EL JSON */}
      <button
        onClick={handleLoadPreset}
        style={{
          ...btnStyle,
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color: isSantander ? "#EC0000" : "#00f0ff",
          fontWeight: 600,
          fontSize: "11px",
        }}
        title="Cargar Diagrama desde public/presets/santander-default.json"
      >
        <FolderDown size={14} />
        <span>Cargar Plantilla</span>
      </button>

      {/* 🗑️ BOTÓN PARA LIMPIAR CANVAS */}
      <button
        onClick={handleClearCanvas}
        style={{ ...btnStyle, color: "#ef4444" }}
        title="Vaciar Canvas"
      >
        <Trash2 size={14} />
      </button>

      <div style={{ width: "1px", height: "18px", backgroundColor: isSantander ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)" }} />

      {/* Auto Layout */}
      <button onClick={runAutoLayout} style={{ ...btnStyle, color: isSantander ? "#EC0000" : "#a855f7" }} title="Organizar Diagrama Automáticamente">
        <Wand2 size={15} />
      </button>

      {/* Snap to Grid */}
      <button
        onClick={onToggleSnap}
        style={{
          ...btnStyle,
          color: snapToGrid ? (isSantander ? "#EC0000" : "#00f0ff") : "#71717a",
        }}
        title="Ajuste Magnético a la Cuadrícula"
      >
        <Grid size={15} />
      </button>

      {/* Zoom Semántico */}
      {onToggleSemanticZoom && (
        <button
          onClick={onToggleSemanticZoom}
          style={{
            ...btnStyle,
            color: isSemanticZoomActive ? (isSantander ? "#EC0000" : "#00f0ff") : "#71717a",
          }}
          title={isSemanticZoomActive ? "Zoom Semántico Activado (Oculta/Muestra capas según zoom)" : "Zoom Semántico Desactivado (Muestra todo)"}
        >
          <Layers size={15} />
        </button>
      )}

      <div style={{ width: "1px", height: "18px", backgroundColor: isSantander ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)" }} />

      {/* Undo / Redo */}
      <button onClick={undo} disabled={past.length === 0} style={{ ...btnStyle, opacity: past.length === 0 ? 0.3 : 1, color: isSantander ? "#111" : "#f4f4f5" }}>
        <Undo2 size={15} />
      </button>

      <button onClick={redo} disabled={future.length === 0} style={{ ...btnStyle, opacity: future.length === 0 ? 0.3 : 1, color: isSantander ? "#111" : "#f4f4f5" }}>
        <Redo2 size={15} />
      </button>

      <div style={{ width: "1px", height: "18px", backgroundColor: isSantander ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)" }} />

      {/* Simulación */}
      <button
        onClick={toggleSimulation}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "6px",
          backgroundColor: isSimulating ? "rgba(239, 68, 68, 0.15)" : isSantander ? "rgba(236, 0, 0, 0.1)" : "rgba(0, 240, 255, 0.15)",
          border: `1px solid ${isSimulating ? "#ef4444" : isSantander ? "#EC0000" : "#00f0ff"}`,
          color: isSimulating ? "#ef4444" : isSantander ? "#EC0000" : "#00f0ff",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {isSimulating ? <Square size={14} fill="#ef4444" /> : <Play size={14} fill={isSantander ? "#EC0000" : "#00f0ff"} />}
        {isSimulating ? "Detener" : "Simular Flujo"}
      </button>

      <div style={{ width: "1px", height: "18px", backgroundColor: isSantander ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)" }} />

      <button onClick={onZoomOut} style={{ ...btnStyle, color: isSantander ? "#111" : "#f4f4f5" }}>
        <Minus size={15} />
      </button>

      <span style={{ fontSize: "12px", color: isSantander ? "#444" : "#a1a1aa", minWidth: "42px", textAlign: "center", fontWeight: 600 }}>
        {Math.round(scale * 100)}%
      </span>

      <button onClick={onZoomIn} style={{ ...btnStyle, color: isSantander ? "#111" : "#f4f4f5" }}>
        <Plus size={15} />
      </button>

      <button onClick={onReset} style={{ ...btnStyle, color: isSantander ? "#111" : "#f4f4f5" }}>
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px",
  borderRadius: "4px",
  transition: "all 0.2s ease",
};