export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface ThemeCanvasConfig {
  backgroundColor: string;
  backgroundImage: string;
  marqueeBg: string;
  marqueeBorder: string;
  guideColor: string;
}

export interface ThemeConnectionsConfig {
  data: string;
  control: string;
  selectionHalo: string;
  glowEffect: boolean;
}

export interface ThemeControlsConfig {
  bg: string;
  border: string;
  boxShadow: string;
  divider: string;
  btnText: string;
  themeBadgeBg: string;
  themeBadgeText: string;
  autoLayoutBtn: string;
  snapGridActive: string;
  simulationBg: string;
  simulationBorder: string;
  simulationText: string;
  simulationIcon: string;
  zoomText: string;
}

export interface ThemeMiniMapConfig {
  bg: string;
  border: string;
  boxShadow: string;
  nodeFill: string;
  nodeGroupFill: string;
  nodeGroupStroke: string;
  viewportFill: string;
  viewportStroke: string;
}

export interface ThemeNodesConfig {
  borderRadius: string;
  hubShape?: "circle" | "rounded" | "hexagon";
  agentShape?: "rounded" | "pill" | "rectangle";
  border: string;
  borderSelected: string;
  bg: string;
  boxShadow: string;
  boxShadowSelected: string;
  headerBg?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  canvas: ThemeCanvasConfig;
  connections: ThemeConnectionsConfig;
  controls: ThemeControlsConfig;
  minimap: ThemeMiniMapConfig;
  nodes: ThemeNodesConfig;
}

export type ThemeId = "neon" | "santander";