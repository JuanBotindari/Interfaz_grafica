"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/ui/Header";

const AgentCanvas = dynamic(() => import("@/components/canvas/AgentCanvas"), {
  ssr: false,
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