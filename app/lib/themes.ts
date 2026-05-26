export type ThemeKey = "sage" | "blue" | "sunrise" | "coastal";

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
export const globalThemeStorageKey = "nafasi_theme_global";

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
    key: "blue",
    name: "Blue",
    background: "#f4f8ff",
    foreground: "#172033",
    surface: "#ffffff",
    muted: "#53627a",
    border: "#cdd9ee",
    accent: "#2563eb",
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

export function accountThemeStorageKey(accountId?: string | null) {
  return accountId ? `nafasi_theme_account_${accountId}` : null;
}
