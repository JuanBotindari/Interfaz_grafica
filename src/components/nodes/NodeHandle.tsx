"use client";

import { useGraphStore } from "@/store/useGraphStore";

interface NodeHandleProps {
  nodeId: string;
  position: "top" | "bottom" | "left" | "right";
}

export default function NodeHandle({ nodeId, position }: NodeHandleProps) {
  const { startConnecting, finishConnecting, connectingSourceId, editorMode } = useGraphStore();

  if (editorMode === "view") return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startConnecting(nodeId, position);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (connectingSourceId) {
      finishConnecting(nodeId, position);
    }
  };

  const getPosStyle = (): React.CSSProperties => {
    switch (position) {
      case "top":
        return { top: "-6px", left: "50%", transform: "translateX(-50%)" };
      case "bottom":
        return { bottom: "-6px", left: "50%", transform: "translateX(-50%)" };
      case "left":
        return { left: "-6px", top: "50%", transform: "translateY(-50%)" };
      case "right":
        return { right: "-6px", top: "50%", transform: "translateY(-50%)" };
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        position: "absolute",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "#00f0ff",
        border: "2px solid #0a0f1d",
        boxShadow: "0 0 8px #00f0ff",
        cursor: "crosshair",
        zIndex: 20,
        transition: "transform 0.15s ease",
        ...getPosStyle(),
      }}
      className="node-handle"
    />
  );
}