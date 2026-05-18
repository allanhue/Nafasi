export type ThemeKey = "sage" | "midnight" | "sunrise" | "coastal";

export type AppTheme = {
  accent: string;
  background: string;
  border: string;
  foreground: string;
  key: ThemeKey;
  muted: string;
  name: string;
  surface: string;
};

export const themeStorageEvent = "nafasi-theme-updated";

export const appThemes: AppTheme[] = [
  {
    key: "sage",
    name: "Sage",
    background: "#f5f6f1",
    foreground: "#20231f",
    surface: "#fbfcf8",
    muted: "#5d665d",
    border: "#d8ddd0",
    accent: "#1d3d35",
  },
  {
    key: "midnight",
    name: "Midnight",
    background: "#101816",
    foreground: "#eff5ef",
    surface: "#17221f",
    muted: "#b4c3ba",
    border: "#2f4039",
    accent: "#8bd8bd",
  },
  {
    key: "sunrise",
    name: "Sunrise",
    background: "#fff7ed",
    foreground: "#30251d",
    surface: "#fffaf3",
    muted: "#6f5a46",
    border: "#ecd5bc",
    accent: "#b45309",
  },
  {
    key: "coastal",
    name: "Coastal",
    background: "#edf8f7",
    foreground: "#1b2f33",
    surface: "#f8fffe",
    muted: "#48676b",
    border: "#bfdcdd",
    accent: "#0f766e",
  },
];

export const defaultThemeKey: ThemeKey = "sage";

export function getThemeByKey(key?: string | null) {
  return appThemes.find((theme) => theme.key === key) ?? appThemes[0];
}
