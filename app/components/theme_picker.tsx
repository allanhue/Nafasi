"use client";

import { appThemes, type ThemeKey, type ThemeScope } from "@/app/lib/themes";

type ThemePickerProps = {
  onChange: (theme: ThemeKey) => void;
  onScopeChange: (scope: ThemeScope) => void;
  scope: ThemeScope;
  value: ThemeKey;
};

export default function ThemePicker({ onChange, onScopeChange, scope, value }: ThemePickerProps) {
  return (
    <fieldset>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Application theme</legend>
          <p className="theme-muted mt-1 text-sm">
            Choose a professional theme and decide whether it applies everywhere or only to this account.
          </p>
        </div>
        <label className="block min-w-52">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] theme-muted">
            Apply to
          </span>
          <select
            className="form-input"
            onChange={(event) => onScopeChange(event.target.value as ThemeScope)}
            value={scope}
          >
            <option value="system">Whole system</option>
            <option value="account">This account only</option>
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {appThemes.map((theme) => {
          const isActive = value === theme.key;

          return (
            <label
              className={`cursor-pointer rounded-md border p-4 shadow-sm transition ${
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
              <span className="mt-4 block rounded-md border p-2" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                <span className="mb-2 flex items-center justify-between">
                  <span className="block h-2 w-16 rounded" style={{ backgroundColor: theme.accent }} />
                  <span className="block h-5 w-12 rounded border" style={{ borderColor: theme.border, backgroundColor: theme.surface }} />
                </span>
                <span className="block h-2 w-4/5 rounded" style={{ backgroundColor: theme.muted }} />
                <span className="mt-2 block h-2 w-2/3 rounded" style={{ backgroundColor: theme.border }} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
