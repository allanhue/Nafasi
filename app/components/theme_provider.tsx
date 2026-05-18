"use client";

import { useEffect } from "react";
import { getThemeByKey, themeStorageEvent } from "@/app/lib/themes";

const PREFERENCES_KEY = "nafasi_preferences";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function syncTheme() {
      applyTheme(readStoredThemeKey());
    }

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(themeStorageEvent, syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(themeStorageEvent, syncTheme);
    };
  }, []);

  return children;
}

export function applyTheme(themeKey?: string | null) {
  if (typeof document === "undefined") {
    return;
  }

  const theme = getThemeByKey(themeKey);
  const root = document.documentElement;
  root.dataset.theme = theme.key;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--foreground", theme.foreground);
  root.style.setProperty("--app-surface", theme.surface);
  root.style.setProperty("--app-muted", theme.muted);
  root.style.setProperty("--app-border", theme.border);
  root.style.setProperty("--app-accent", theme.accent);
}

function readStoredThemeKey() {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    const preferences = stored ? JSON.parse(stored) : {};
    return typeof preferences.theme === "string" ? preferences.theme : null;
  } catch {
    return null;
  }
}
