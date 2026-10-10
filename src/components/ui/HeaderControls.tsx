// src/components/ui/HeaderControls.tsx
"use client";

import { Save, FolderOpen, FileDown, LayoutTemplate, Eye, Edit3 } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";
import { PRESET_TEMPLATES } from "@/utils/templates";
import { getThemeConfig } from "@/config/themes";

export default function HeaderControls() {
  const {
    saveToFile,
    exportGraphToJson,
    importGraphFromJson,
    loadPresetTemplate,
    theme,
    currentFileHandle,
    editorMode,
    setEditorMode,
  } = useGraphStore();

  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const actionBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.52)",
    borderRadius: "5px",
    color: "#151516ff",
    padding: "5px 16px",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.3px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  const selectTemplateStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.52)",
    borderRadius: "5px",
    color: "#151516ff",
    padding: "5px 14px",
    fontSize: "13px",
    fontWeight: 500,
    outline: "none",
    cursor: "pointer",
  };

  const handleOpenFile = async () => {
    if (typeof window !== "undefined" && "showOpenFilePicker" in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: "JSON File", accept: { "application/json": [".json"] } }],
          multiple: false,
        });
        const file = await handle.getFile();
        const text = await file.text();
        importGraphFromJson(text, handle);
      } catch (err: any) {
        // user cancelled
      }
    }
  };

  return (
    <>
      <style>{`
        .hc-btn { opacity: 0.92; }
        .hc-btn:hover { opacity: 1; filter: brightness(1.08); transform: translateY(-1px); }
        .hc-btn:active { transform: translateY(0); opacity: 0.85; }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {/* Mode toggle */}
      <button
        className="hc-btn"
        onClick={() => setEditorMode(editorMode === "view" ? "edit" : "view")}
        style={{
          ...actionBtnStyle,
          backgroundColor: editorMode === "view"
            ? "rgba(220, 240, 230, 1)"
            : "rgba(230, 225, 245, 0.75)",
          border: `1px solid ${editorMode === "view" ? "rgba(100, 160, 120, 0.4)" : "rgba(140, 120, 180, 0.4)"}`,
          color: editorMode === "view" ? "#2d6a4f" : "#5b3e8a",
        }}
        title={editorMode === "view" ? "Modo Vista" : "Modo Edición"}
      >
        {editorMode === "view" ? <Eye size={13} /> : <Edit3 size={13} />}
        {editorMode === "view" ? "Vista" : "Edición"}
      </button>

      {/* Save */}
      <button
        className="hc-btn"
        onClick={() => saveToFile()}
        style={actionBtnStyle}
        title="Guardar cambios"
      >
        <Save size={14} /> Guardar
      </button>

      {/* Open */}
      <button className="hc-btn" onClick={handleOpenFile} style={actionBtnStyle} title="Abrir JSON">
        <FolderOpen size={14} /> Abrir JSON
      </button>

      {/* Export */}
      <button className="hc-btn" onClick={exportGraphToJson} style={actionBtnStyle} title="Exportar copia">
        <FileDown size={14} /> Exportar
      </button>

      {/* Template selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <LayoutTemplate size={14} />
        <select
          className="hc-btn"
          onChange={(e) => {
            const tmpl = PRESET_TEMPLATES.find((t) => t.id === e.target.value);
            if (tmpl) {
              loadPresetTemplate(tmpl.nodes, tmpl.connections);
            }
            e.target.value = "";
          }}
          defaultValue=""
          style={selectTemplateStyle}
        >
          <option value="" disabled>Cargar Plantilla...</option>
          {PRESET_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
    </>
  );
}
