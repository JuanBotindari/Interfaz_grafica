"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { AIModel, NodeType } from "@/types";
import { Cpu, Settings2, CheckCircle2, Info, Bot, Sparkles, Shapes } from "lucide-react";

export default function NodeInspector() {
  const { selectedNodeIds, updateNode, nodes, connections } = useGraphStore();
  const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));

  if (!selectedNode) {
    return (
      <aside
        onMouseDown={(e) => e.stopPropagation()}
        style={asideContainerStyle}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Cpu size={20} color="#00f0ff" />
          <h3 style={headerTitleStyle}>Panel de Control</h3>
        </div>

        <div style={dividerStyle} />

        <div style={sectionContainerStyle}>
          <span style={sectionHeaderStyle}>Métricas del Sistema</span>

          <div style={fieldStyle}>
            <span style={labelStyle}>Entorno</span>
            <span style={{ ...valueStyle, color: "#22c55e", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={13} /> Producción v2.4
            </span>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Nodos Activos</span>
            <span style={valueStyle}>{nodes.length} Nodos</span>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Conexiones</span>
            <span style={valueStyle}>{connections.length} Enlaces</span>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Latencia Global</span>
            <span style={{ ...valueStyle, color: "#00f0ff", fontFamily: "monospace" }}>14.2 ms</span>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Estado de Red</span>
            <span style={{ ...valueStyle, color: "#38bdf8" }}>Sincronizado</span>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Memoria Usada</span>
            <span style={valueStyle}>128 MB / 512 MB</span>
          </div>
        </div>

        <div style={{ marginTop: "auto" }}>
          <div style={dividerStyle} />
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", paddingTop: "12px" }}>
            <Info size={16} color="#71717a" style={{ marginTop: "2px", flexShrink: 0 }} />
            <p style={{ fontSize: "12px", color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
              Selecciona un nodo para editar sus parámetros e instrucciones de IA.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const handleChange = (field: string, value: unknown) => {
    updateNode(selectedNode.id, { [field]: value });
  };

  return (
    <aside
      onMouseDown={(e) => e.stopPropagation()}
      style={{ ...asideContainerStyle, borderRight: "1px solid rgba(0, 240, 255, 0.3)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Settings2 size={20} color="#00f0ff" />
        <h3 style={headerTitleStyle}>Configuración de Nodo</h3>
      </div>

      <div style={dividerStyle} />

      <div style={sectionContainerStyle}>
        <span style={sectionHeaderStyle}>General</span>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Nombre del Nodo</label>
          <input
            type="text"
            value={selectedNode.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            style={inputStyle}
            placeholder="Nombre del nodo..."
          />
        </div>

        <div style={inputGroupStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Shapes size={13} color="#00f0ff" />
            <label style={labelStyle}>Tipo / Forma de Nodo</label>
          </div>
          <select
            value={selectedNode.type}
            onChange={(e) => {
              const newType = e.target.value as NodeType;
              // Limpiar width/height al cambiar de tipo para adoptar los
              // tamaños por defecto de NODE_SIZES del nuevo tipo.
              useGraphStore.getState().updateNode(selectedNode.id, {
                type: newType,
                width: undefined,
                height: undefined,
              });
            }}
            style={selectStyle}
          >
            <option value="HUB">Nodo Central (HUB)</option>
            <option value="DEPARTMENT">Departamento (DEPARTMENT)</option>
            <option value="AREA">Área Principal (AREA)</option>
            <option value="HUB2">Sub área (HUB2)</option>
            <option value="PROCESS">Proceso</option>
            <option value="SUBPROCESS">Sub-proceso</option>
            <option value="AGENT">Agente IA</option>
            <option value="KNOWLEDGE_BASE">Base de Conocimiento</option>
            <option value="TASK">Tarea / Paso</option>
            <option value="DECISION">Decisión / Condición</option>
            <option value="ACTION">Acción / Salida</option>
            <option value="RESOURCE">Recurso</option>
            <option value="TOOL">Herramienta</option>
            <option value="WORKER">Ejecutor Micro</option>
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Rol / Función</label>
          <input
            type="text"
            value={selectedNode.role || ""}
            onChange={(e) => handleChange("role", e.target.value)}
            style={inputStyle}
            placeholder="Rol o responsabilidad..."
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Estado</label>
          <select
            value={selectedNode.status || "Idle"}
            onChange={(e) => handleChange("status", e.target.value)}
            style={selectStyle}
          >
            <option value="Active">Active (Activo)</option>
            <option value="Idle">Idle (En espera)</option>
            <option value="Error">Error (Fallo)</option>
          </select>
        </div>
      </div>

      {selectedNode.type === "AGENT" && (
        <>
          <div style={dividerStyle} />

          <div style={sectionContainerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Bot size={14} color="#00f0ff" />
              <span style={sectionHeaderStyle}>Parámetros de IA</span>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Modelo Asignado</label>
              <select
                value={selectedNode.model || "GPT-4o"}
                onChange={(e) => handleChange("model", e.target.value as AIModel)}
                style={selectStyle}
              >
                <option value="GPT-4o">GPT-4o (OpenAI)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                <option value="Local Ollama">Local Ollama (Llama 3)</option>
              </select>
            </div>

            <div style={inputGroupStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={labelStyle}>System Prompt</label>
                <Sparkles size={12} color="#00f0ff" />
              </div>
              <textarea
                rows={5}
                value={selectedNode.systemPrompt || ""}
                onChange={(e) => handleChange("systemPrompt", e.target.value)}
                style={textareaStyle}
                placeholder="Instrucciones del sistema para el agente..."
              />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

const asideContainerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  height: "100%",
  zIndex: 30,
  width: "290px",
  backgroundColor: "rgba(10, 15, 29, 0.94)",
  backdropFilter: "blur(16px)",
  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "24px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  color: "#f4f4f5",
  boxShadow: "10px 0 30px rgba(0, 0, 0, 0.5)",
  overflowY: "auto",
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  margin: 0,
  color: "#f4f4f5",
  letterSpacing: "0.01em",
};

const sectionContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#71717a",
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  height: "1px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "13px",
  padding: "4px 0",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  fontWeight: 500,
};

const valueStyle: React.CSSProperties = {
  color: "#f4f4f5",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  color: "#ffffff",
  fontSize: "12px",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: "#0f172a",
  cursor: "pointer",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: "inherit",
  lineHeight: "1.4",
};