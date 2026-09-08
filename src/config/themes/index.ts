import { ThemeConfig } from "./types";
import { santanderTheme } from "./santander";
import { neonTheme } from "./neon";

export * from "./types";
export { santanderTheme } from "./santander";
export { neonTheme } from "./neon";

export const themes: Record<string, ThemeConfig> = {
  neon: neonTheme,
  santander: santanderTheme,
};

export const defaultTheme = neonTheme;

export function getThemeConfig(themeId?: string): ThemeConfig {
  if (!themeId || !themes[themeId]) {
    return defaultTheme;
  }
  return themes[themeId];
}