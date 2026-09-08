"use client";

import { useRef, useState } from "react";
import { useGraphStore } from "@/store/useGraphStore";
import { PRESET_TEMPLATES } from "@/utils/templates";
import { getThemeConfig } from "@/config/themes";
import { Save, FolderOpen, FileDown, LayoutTemplate, CheckCircle2, AlertCircle, Eye, Edit3 } from "lucide-react";

export default function ExportImportPanel() {
  const { saveToFile, exportGraphToJson, importGraphFromJson, loadPresetTemplate, theme, currentFileHandle, editorMode, setEditorMode } = useGraphStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const themeConfig = getThemeConfig(theme);
  const isSantander = theme === "santander";

  const showNotification = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
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
        const success = importGraphFromJson(text, handle);
        if (success) {
          showNotification("success", `Archivo '${file.name}' abierto y vinculado.`);
        } else {
          showNotification("error", "El archivo JSON no tiene un formato válido.");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          fileInputRef.current?.click();
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    const success = await saveToFile();
    if (success) {
      showNotification("success", currentFileHandle ? "Cambios guardados directamente en el archivo." : "Archivo guardado exitosamente.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importGraphFromJson(content, null);
      if (success) {
        showNotification("success", `Archivo '${file.name}' cargado.`);
      } else {
        showNotification("error", "El archivo JSON no tiene un formato válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const actionBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: isSantander ? "rgba(236, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.05)",
    border: `1px solid ${isSantander ? "rgba(236, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.15)"}`,
    borderRadius: "6px",
    color: themeConfig.controls.btnText,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const selectTemplateStyle: React.CSSProperties = {
    backgroundColor: isSantander ? "#ffffff" : "#0f172a",
    border: `1px solid ${isSantander ? "rgba(236, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)"}`,
    borderRadius: "6px",
    color: themeConfig.controls.btnText,
    padding: "6px 8px",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "20px",
        left: "310px",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: themeConfig.controls.bg,
        border: `1px solid ${themeConfig.controls.border}`,
        borderRadius: "10px",
        padding: "8px 12px",
        backdropFilter: "blur(12px)",
        boxShadow: themeConfig.controls.boxShadow,
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        style={{ display: "none" }}
      />

      {/* Conmutador de Modo: Vista vs Edición */}
      <button
        onClick={() => setEditorMode(editorMode === "view" ? "edit" : "view")}
        style={{
          ...actionBtnStyle,
          backgroundColor: editorMode === "view"
            ? (isSantander ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.2)")
            : (isSantander ? "rgba(236, 0, 0, 0.12)" : "rgba(0, 240, 255, 0.2)"),
          border: `1px solid ${editorMode === "view" ? "#10b981" : (isSantander ? "#EC0000" : "#00f0ff")}`,
          color: editorMode === "view" ? "#10b981" : (isSantander ? "#EC0000" : "#00f0ff"),
          fontWeight: 700,
        }}
        title={editorMode === "view" ? "Modo Vista: Clic para Zoom Nivel por Nivel (Edición deshabilitada)" : "Modo Edición: Permite mover, arrastrar y editar nodos"}
      >
        {editorMode === "view" ? <Eye size={14} color="#10b981" /> : <Edit3 size={14} color={isSantander ? "#EC0000" : "#00f0ff"} />}
        {editorMode === "view" ? "Modo Vista" : "Modo Edición"}
      </button>

      <div style={{ width: "1px", height: "18px", backgroundColor: themeConfig.controls.divider }} />

      {/* Botón Guardar (Guardado directo en el mismo archivo) */}
      <button
        onClick={handleSave}
        style={{
          ...actionBtnStyle,
          backgroundColor: isSantander ? "rgba(236, 0, 0, 0.1)" : "rgba(0, 240, 255, 0.15)",
          border: `1px solid ${themeConfig.colors.primary}`,
          color: themeConfig.colors.primary,
        }}
        title="Guardar cambios directamente sobre el archivo abierto (Ctrl+S / Save)"
      >
        <Save size={14} color={themeConfig.colors.primary} />
        Guardar
      </button>

      {/* Botón Abrir */}
      <button
        onClick={handleOpenFile}
        style={actionBtnStyle}
        title="Abrir y vincular archivo JSON local"
      >
        <FolderOpen size={14} color={themeConfig.colors.primary} />
        Abrir JSON
      </button>

      {/* Botón Exportar */}
      <button
        onClick={exportGraphToJson}
        style={actionBtnStyle}
        title="Descargar copia como nuevo archivo JSON"
      >
        <FileDown size={14} color={themeConfig.colors.textSecondary} />
        Exportar Copia
      </button>

      <div style={{ width: "1px", height: "18px", backgroundColor: themeConfig.controls.divider }} />

      {/* Selector de Plantillas */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <LayoutTemplate size={14} color={themeConfig.colors.textSecondary} />
        <select
          onChange={(e) => {
            const selected = PRESET_TEMPLATES.find((t) => t.id === e.target.value);
            if (selected) {
              loadPresetTemplate(selected.nodes, selected.connections);
              showNotification("success", `Plantilla '${selected.name}' cargada.`);
            }
            e.target.value = "";
          }}
          defaultValue=""
          style={selectTemplateStyle}
        >
          <option value="" disabled>
            Cargar Plantilla...
          </option>
          {PRESET_TEMPLATES.map((tmpl) => (
            <option key={tmpl.id} value={tmpl.id}>
              {tmpl.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notificación Flotante */}
      {notification && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "0",
            backgroundColor: notification.type === "success" ? "rgba(34, 197, 94, 0.95)" : "rgba(239, 68, 68, 0.95)",
            color: "#ffffff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {notification.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {notification.msg}
        </div>
      )}
    </div>
  );
}