"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/ui/Header";

const AgentCanvas = dynamic(() => import("@/components/canvas/AgentCanvas"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#05070c",
      color: "#06b6d4",
      fontFamily: "monospace",
      fontSize: "14px",
      flexDirection: "column",
      gap: "12px",
    }}>
      <div style={{
        width: "32px",
        height: "32px",
        border: "3px solid #1e293b",
        borderTopColor: "#06b6d4",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span>INICIALIZANDO CANVAS...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function Page() {
  return (
    <main style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#05070c" }}>
      <Header />
      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
        <AgentCanvas />
      </div>
    </main>
  );
}