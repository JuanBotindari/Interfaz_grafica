"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { getThemeConfig } from "@/config/themes";

interface MiniMapProps {
  scale: number;
  position: { x: number; y: number };
  onNavigate: (newX: number, newY: number) => void;
}

export default function MiniMap({ scale, position, onNavigate }: MiniMapProps) {
  const { nodes, theme } = useGraphStore();
  const themeConfig = getThemeConfig(theme);

  const MAP_WIDTH = 180;
  const MAP_HEIGHT = 120;

  if (nodes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + 160 > maxX) maxX = n.x + 160;
    if (n.y + 120 > maxY) maxY = n.y + 120;
  });

  minX = Math.min(minX, -200);
  minY = Math.min(minY, -200);
  maxX = Math.max(maxX, 1200);
  maxY = Math.max(maxY, 800);

  const worldWidth = maxX - minX;
  const worldHeight = maxY - minY;

  const mapScale = Math.min(MAP_WIDTH / worldWidth, MAP_HEIGHT / worldHeight);

  const viewWidth = (typeof window !== "undefined" ? window.innerWidth : 1200) / scale;
  const viewHeight = (typeof window !== "undefined" ? window.innerHeight : 800) / scale;

  const viewX = (-position.x / scale - minX) * mapScale;
  const viewY = (-position.y / scale - minY) * mapScale;
  const viewBoxW = viewWidth * mapScale;
  const viewBoxH = viewHeight * mapScale;

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const targetWorldX = (e.clientX - rect.left) / mapScale + minX;
    const targetWorldY = (e.clientY - rect.top) / mapScale + minY;

    onNavigate(-(targetWorldX - viewWidth / 2) * scale, -(targetWorldY - viewHeight / 2) * scale);
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "24px",
        left: "24px",
        width: `${MAP_WIDTH}px`,
        height: `${MAP_HEIGHT}px`,
        backgroundColor: themeConfig.minimap.bg,
        border: `1px solid ${themeConfig.minimap.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 40,
        boxShadow: themeConfig.minimap.boxShadow,
        backdropFilter: "blur(12px)",
      }}
    >
      <svg width={MAP_WIDTH} height={MAP_HEIGHT} style={{ cursor: "crosshair" }} onClick={handleMapClick}>
        {nodes.map((n) => {
          const nx = (n.x - minX) * mapScale;
          const ny = (n.y - minY) * mapScale;
          const nw = (n.width || 140) * mapScale;
          const nh = (n.height || 80) * mapScale;
          const isGroup = (n.type as string) === "GROUP";

          return (
            <rect
              key={n.id}
              x={nx}
              y={ny}
              width={Math.max(nw, 4)}
              height={Math.max(nh, 3)}
              fill={isGroup ? themeConfig.minimap.nodeGroupFill : themeConfig.minimap.nodeFill}
              stroke={isGroup ? themeConfig.minimap.nodeGroupStroke : "none"}
              strokeWidth={0.5}
              rx={1}
            />
          );
        })}

        <rect
          x={viewX}
          y={viewY}
          width={viewBoxW}
          height={viewBoxH}
          fill={themeConfig.minimap.viewportFill}
          stroke={themeConfig.minimap.viewportStroke}
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
}