"use client";

import { Search, Command } from "lucide-react";

interface ToolbarProps {
  viewMode: "tree" | "orbital";
  setViewMode: (mode: "tree" | "orbital") => void;
}

export default function Toolbar({ viewMode, setViewMode }: ToolbarProps) {
  return (
    <header
      style={{
        height: "50px",
        backgroundColor: "#07090e",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "10px", color: "#52525b" }}>// CORE</span>
        <h1 style={{ fontSize: "13px", fontWeight: "bold", color: "#f4f4f5", letterSpacing: "1px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          OPTIMAL ENGINE
          <span style={{ fontSize: "9px", backgroundColor: "#18181b", padding: "2px 6px", borderRadius: "3px", border: "1px solid #27272a", color: "#a1a1aa" }}>
            NEURAL
          </span>
        </h1>
      </div>

      {/* Command Search */}
      <div style={{ flex: 1, maxWidth: "480px", margin: "0 20px" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={13} color="#52525b" style={{ position: "absolute", left: "10px" }} />
          <input
            type="text"
            placeholder="dump into the brain... or drop documents"
            style={{
              width: "100%",
              backgroundColor: "#030407",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              padding: "6px 36px",
              fontSize: "11px",
              color: "#e4e4e7",
              outline: "none"
            }}
          />
          <div style={{ position: "absolute", right: "8px", display: "flex", alignItems: "center", gap: "2px", fontSize: "9px", color: "#52525b", backgroundColor: "#18181b", padding: "2px 4px", borderRadius: "3px" }}>
            <Command size={10} /> K
          </div>
        </div>
      </div>

      {/* Mode Switches */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => setViewMode("tree")}
          style={{
            padding: "4px 10px",
            fontSize: "10px",
            borderRadius: "3px",
            backgroundColor: viewMode === "tree" ? "rgba(6,182,212,0.2)" : "#18181b",
            color: viewMode === "tree" ? "#22d3ee" : "#71717a",
            border: viewMode === "tree" ? "1px solid rgba(6,182,212,0.5)" : "1px solid #27272a"
          }}
        >
          TREE DIAGRAM
        </button>
        <button
          onClick={() => setViewMode("orbital")}
          style={{
            padding: "4px 10px",
            fontSize: "10px",
            borderRadius: "3px",
            backgroundColor: viewMode === "orbital" ? "rgba(236,72,153,0.2)" : "#18181b",
            color: viewMode === "orbital" ? "#f472b6" : "#71717a",
            border: viewMode === "orbital" ? "1px solid rgba(236,72,153,0.5)" : "1px solid #27272a"
          }}
        >
          ORBITAL NETWORK
        </button>
      </div>
    </header>
  );
}