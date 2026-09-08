"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";
import { Brain, Bot, Wrench, Cpu, Boxes, Network, Link2, Trash2, Plus, GripVertical, CheckSquare, Diamond, GitBranch, Database, Zap, FileStack, FolderTree } from "lucide-react";
import { NodeType } from "@/types";

interface NodeOption {
  type: NodeType;
  name: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export default function Sidebar() {
  const {
    connectingSourceId,
    cancelConnecting,
    selectedNodeIds,
    deleteSelectedNodes,
    recordSnapshot,
    theme,
    editorMode,
  } = useGraphStore();

  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";
  const isConnecting = !!connectingSourceId;

  if (editorMode === "view") {
    return null; // En modo vista la paleta de creación de formas no estorba en pantalla
  }

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleAddNode = (type: NodeType, name: string) => {
    recordSnapshot();
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      name,
      role: "Sin definir",
      type,
      status: "Idle" as const,
      x: 300,
      y: 200,
      ...(type === "GROUP" ? { width: 400, height: 250 } : {}),
    };
    useGraphStore.setState((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeIds: [newId],
    }));
  };

  const nodeOptions: NodeOption[] = [
    {
      type: "HUB",
      name: "CORE HUB",
      label: "Nodo Central",
      description: "Forma circular grande para núcleo de orquestación",
      icon: Brain,
      color: themeConfig.colors.primary,
    },
    {
      type: "HUB2",
      name: "Nueva Sub área",
      label: "Sub área",
      description: "Círculo mediano para sub áreas principales",
      icon: Network,
      color: isSantander ? "#f05050" : "#38bdf8",
    },
    {
      type: "PROCESS",
      name: "Nuevo Proceso",
      label: "Proceso",
      description: "Contenedor principal de proceso",
      icon: FolderTree,
      color: isSantander ? "#EC0000" : "#a855f7",
    },
    {
      type: "AGENT",
      name: "Nuevo Agente",
      label: "Agente IA",
      description: "Tarjeta con modelo, rol y estado",
      icon: Bot,
      color: isSantander ? "#EC0000" : "#38bdf8",
    },
    {
      type: "TASK",
      name: "Nueva Tarea",
      label: "Tarea",
      description: "Paso de proceso con header de color",
      icon: CheckSquare,
      color: isSantander ? "#EC0000" : "#6366f1",
    },
    {
      type: "DECISION",
      name: "Decisión",
      label: "Decisión / Bifurcación",
      description: "Rombo para bifurcaciones lógicas",
      icon: Diamond,
      color: "#f59e0b",
    },
    {
      type: "SUBPROCESS",
      name: "Nuevo Subproceso",
      label: "Subproceso / Área",
      description: "Tarjeta con doble borde para áreas",
      icon: GitBranch,
      color: isSantander ? "#EC0000" : "#818cf8",
    },
    {
      type: "KNOWLEDGE_BASE",
      name: "Base de Conocimiento",
      label: "Base de Conocimiento",
      description: "Cilindro para datos / RAG",
      icon: Database,
      color: "#10b981",
    },
    {
      type: "ACTION",
      name: "Nueva Acción",
      label: "Acción / Output",
      description: "Píldora compacta para acciones",
      icon: Zap,
      color: isSantander ? "#d97706" : "#fb923c",
    },
    {
      type: "RESOURCE",
      name: "Recurso",
      label: "Recurso / Fuente",
      description: "Ícono pequeño con etiqueta",
      icon: FileStack,
      color: "#a78bfa",
    },
    {
      type: "TOOL",
      name: "Herramienta API",
      label: "Herramienta",
      description: "Micro nodo para herramientas externas",
      icon: Wrench,
      color: "#fca5a5",
    },
    {
      type: "WORKER",
      name: "Worker Procesador",
      label: "Worker / Proceso",
      description: "Mini tarjeta de procesamiento",
      icon: Cpu,
      color: "#94a3b8",
    },
    {
      type: "GROUP",
      name: "Grupo de Nodos",
      label: "Grupo / Contenedor",
      description: "Marco para agrupar múltiples nodos",
      icon: Boxes,
      color: "#a855f7",
    },
  ];

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    backgroundColor: isSantander ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.05)",
    border: `1px solid ${isSantander ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)"}`,
    borderRadius: "8px",
    color: themeConfig.controls.btnText,
    cursor: "grab",
    transition: "all 0.2s ease",
    textAlign: "left",
    userSelect: "none",
  };

  return (
    <aside
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 30,
        width: "230px",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        backgroundColor: themeConfig.controls.bg,
        backdropFilter: "blur(12px)",
        border: `1px solid ${themeConfig.controls.border}`,
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        color: themeConfig.controls.btnText,
        boxShadow: themeConfig.controls.boxShadow,
        scrollbarWidth: "thin",
      }}
    >
      {/* Sección: Añadir Nodos / Formas */}
      <div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: themeConfig.colors.textSecondary,
            marginBottom: "10px",
            display: "block",
          }}
        >
          Formas de Nodos (Arrastrar)
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {nodeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                draggable
                onDragStart={(e) => handleDragStart(e, opt.type)}
                onClick={() => handleAddNode(opt.type, opt.name)}
                style={buttonStyle}
                title={`${opt.label}: ${opt.description} (Haz clic o arrastra al canvas)`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isSantander
                    ? "rgba(236, 0, 0, 0.06)"
                    : "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSantander
                    ? "rgba(0, 0, 0, 0.03)"
                    : "rgba(255, 255, 255, 0.05)";
                }}
              >
                <GripVertical size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                <Icon size={16} color={opt.color} style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {opt.label}
                  </span>
                </div>
                <Plus size={14} style={{ marginLeft: "auto", opacity: 0.5, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: themeConfig.controls.divider }} />

      {/* Herramientas de Conexión */}
      <div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: themeConfig.colors.textSecondary,
            marginBottom: "8px",
            display: "block",
          }}
        >
          Conexiones
        </span>

        <button
          onClick={() => {
            if (isConnecting) cancelConnecting();
          }}
          style={{
            ...buttonStyle,
            backgroundColor: isConnecting
              ? isSantander
                ? "rgba(236, 0, 0, 0.15)"
                : "rgba(0, 240, 255, 0.2)"
              : isSantander
              ? "rgba(0, 0, 0, 0.03)"
              : "rgba(255, 255, 255, 0.05)",
            border: isConnecting
              ? `1px solid ${themeConfig.colors.primary}`
              : `1px solid ${isSantander ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <Link2 size={16} color={isConnecting ? themeConfig.colors.primary : themeConfig.colors.textSecondary} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: isConnecting ? themeConfig.colors.primary : themeConfig.controls.btnText }}>
            {isConnecting ? "Modo Enlace Activo" : "Conectar Nodos"}
          </span>
        </button>
      </div>

      {/* Acción de Eliminación */}
      {selectedNodeIds.length > 0 && (
        <>
          <div style={{ height: "1px", backgroundColor: themeConfig.controls.divider }} />
          <div>
            <button
              onClick={deleteSelectedNodes}
              style={{
                ...buttonStyle,
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
              }}
            >
              <Trash2 size={16} color="#ef4444" />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#fca5a5" }}>Eliminar Selección</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}