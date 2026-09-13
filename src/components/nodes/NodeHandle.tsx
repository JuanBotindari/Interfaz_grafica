"use client";

import { useGraphStore } from "@/store/useGraphStore";

interface NodeHandleProps {
  nodeId: string;
  position: "top" | "bottom" | "left" | "right";
}

export default function NodeHandle({ nodeId, position }: NodeHandleProps) {
  const { startConnecting, finishConnecting, cancelConnecting, updateTempMousePos, editorMode } = useGraphStore();

  if (editorMode === "view") return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    startConnecting(nodeId, position);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { connectingSourceId } = useGraphStore.getState();
    if (!connectingSourceId) return;

    e.stopPropagation();
    e.preventDefault();

    // Buscar el contenedor transformado del canvas
    const canvasContainer = document.querySelector<HTMLElement>("[data-canvas-viewport]");
    if (!canvasContainer) return;

    const containerRect = canvasContainer.getBoundingClientRect();
    // Obtener transform / zoom actual de data attribute o matriz
    const scaleAttr = canvasContainer.getAttribute("data-canvas-scale");
    const scale = scaleAttr ? parseFloat(scaleAttr) : 1;

    const canvasX = (e.clientX - containerRect.left) / scale;
    const canvasY = (e.clientY - containerRect.top) / scale;

    updateTempMousePos({ x: canvasX, y: canvasY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget;

    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }

    // Elemento bajo la posición final del puntero
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    const handleEl = dropTarget?.closest<HTMLElement>("[data-node-handle]");

    if (handleEl) {
      const targetNodeId = handleEl.getAttribute("data-node-id");
      const targetPosition = handleEl.getAttribute("data-handle-position") as any;
      if (targetNodeId) {
        finishConnecting(targetNodeId, targetPosition);
        return;
      }
    }

    cancelConnecting();
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
      data-node-handle="true"
      data-node-id={nodeId}
      data-handle-position={position}
      data-handle-id={`${nodeId}-${position}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        backgroundColor: "#00f0ff",
        border: "2px solid #0a0f1d",
        boxShadow: "0 0 8px #00f0ff",
        cursor: "crosshair",
        zIndex: 20,
        touchAction: "none",
        transition: "transform 0.15s ease",
        ...getPosStyle(),
      }}
      className="node-handle"
    />
  );
}