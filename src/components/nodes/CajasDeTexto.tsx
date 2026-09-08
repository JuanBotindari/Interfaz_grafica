"use client";

interface CajasDeTextoProps {
  title: string;
  category?: string;
  zoomScale: number;
}

export default function CajasDeTexto({ title, category = "DEPARTMENT", zoomScale }: CajasDeTextoProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      {zoomScale >= 0.8 && (
        <span style={{ fontSize: "8px", color: "#06b6d4", letterSpacing: "2px", fontWeight: "bold" }}>
          // {category}
        </span>
      )}
      <h2 style={{ 
        fontSize: "16px", 
        letterSpacing: "4px", 
        color: "#f4f4f5", 
        fontWeight: "bold", 
        margin: 0 
      }}>
        {title}
      </h2>
    </div>
  );
}