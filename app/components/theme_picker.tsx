"use client";

import { appThemes, type ThemeKey } from "@/app/lib/themes";

type ThemePickerProps = {
  onChange: (theme: ThemeKey) => void;
  value: ThemeKey;
};

export default function ThemePicker({ onChange, value }: ThemePickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[var(--foreground)]">Application theme</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {appThemes.map((theme) => {
          const isActive = value === theme.key;

          return (
            <label
              className={`cursor-pointer rounded-lg border p-3 transition ${
                isActive ? "border-[var(--app-accent)] ring-2 ring-[color:var(--app-accent)]/20" : "border-[var(--app-border)]"
              }`}
              key={theme.key}
              style={{ backgroundColor: theme.surface, color: theme.foreground }}
            >
              <input
                checked={isActive}
                className="sr-only"
                onChange={() => onChange(theme.key)}
                type="radio"
                value={theme.key}
              />
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{theme.name}</span>
                <span className="flex gap-1">
                  {[theme.background, theme.surface, theme.accent].map((color) => (
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 rounded-md border border-black/10"
                      key={color}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </span>
              <span className="mt-3 block h-10 rounded-md border" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                <span className="m-2 block h-3 w-2/3 rounded" style={{ backgroundColor: theme.accent }} />
                <span className="mx-2 block h-2 w-1/2 rounded" style={{ backgroundColor: theme.muted }} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
