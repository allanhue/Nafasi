"use client";

import { useEffect } from "react";
import { authSessionEvent, readStoredUser } from "@/app/lib/auth";
import {
  accountThemeStorageKey,
  defaultThemeKey,
  getThemeByKey,
  globalThemeStorageKey,
  themeStorageEvent,
} from "@/app/lib/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function syncTheme() {
      applyTheme(readStoredThemeKey());
    }

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(authSessionEvent, syncTheme);
    window.addEventListener(themeStorageEvent, syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(authSessionEvent, syncTheme);
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
  root.style.setProperty("--app-subtle", `color-mix(in srgb, ${theme.accent} 10%, ${theme.background})`);
  root.style.setProperty("--app-hover", `color-mix(in srgb, ${theme.accent} 14%, ${theme.background})`);
}

function readStoredThemeKey() {
  const accountKey = accountThemeStorageKey(readCurrentAccountId());
  const accountTheme = accountKey ? window.localStorage.getItem(accountKey) : null;
  const globalTheme = window.localStorage.getItem(globalThemeStorageKey);
  const legacyTheme = readLegacyPreferenceTheme();

  return getThemeByKey(accountTheme ?? globalTheme ?? legacyTheme ?? defaultThemeKey).key;
}

function readCurrentAccountId() {
  const user = readStoredUser();
  return user?.email ?? user?.name ?? null;
}

function readLegacyPreferenceTheme() {
  try {
    const stored = window.localStorage.getItem("nafasi_preferences");
    const preferences = stored ? JSON.parse(stored) : {};
    return typeof preferences.theme === "string" ? preferences.theme : null;
  } catch {
    return null;
  }
}
