"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingOverlay from "@/app/components/loading_overlay";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { applyTheme } from "@/app/components/theme_provider";
import ThemePicker from "@/app/components/theme_picker";
import { clearSession, roleLabels, type AuthUser, readStoredUser } from "@/app/lib/auth";
import { defaultFeature } from "@/app/lib/features";
import {
  accountThemeStorageKey,
  defaultThemeKey,
  getThemeByKey,
  globalThemeStorageKey,
  themeStorageEvent,
  type ThemeKey,
} from "@/app/lib/themes";

type SetupPreferences = {
  emailNotifications: boolean;
  language: string;
  theme: ThemeKey;
};

export default function UserSetup() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [preferences, setPreferences] = useState<SetupPreferences>(defaultPreferences());

  useEffect(() => {
    const id = window.setTimeout(() => {
      setUser(readStoredUser());
      setPreferences(readStoredPreferences());
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  function handleSignOut() {
    clearSession();
    window.location.href = "/home";
  }

  function handlePreferenceChange<K extends keyof SetupPreferences>(
    key: K,
    value: SetupPreferences[K]
  ) {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    window.localStorage.setItem("nafasi_preferences", JSON.stringify(updated));

    if (key === "theme") {
      saveTheme(value as ThemeKey, user);
      showThemeSync();
    }
  }

  function showThemeSync() {
    setIsApplyingTheme(true);
    window.setTimeout(() => setIsApplyingTheme(false), 550);
  }

  return (
    <div className="theme-bg min-h-screen">
      <LoadingOverlay isLoading={isApplyingTheme} label="Syncing theme..." />
      <Sidebar activeFeature={defaultFeature} />
      <Navbar activeFeature={defaultFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="theme-surface mb-6 rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="theme-muted text-xs font-semibold uppercase tracking-[0.18em]">
                  Account setup
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Workspace preferences</h1>
                <p className="theme-muted mt-3 max-w-2xl text-sm leading-6">
                  Manage account details, notifications, and system appearance from one polished control center.
                </p>
              </div>
              <span className="rounded-md border border-[var(--app-border)] px-3 py-2 text-sm font-semibold theme-accent-text">
                User theme
              </span>
            </div>
          </section>

          <div className="grid gap-5">
            <section className="theme-surface rounded-lg border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="theme-accent grid h-16 w-16 place-items-center rounded-full text-2xl font-semibold">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user?.name ?? "Nafasi user"}</h2>
                    <p className="theme-muted text-sm">{user?.email ?? "No email"}</p>
                    <span className="theme-accent mt-1 inline-flex rounded-md px-3 py-1 text-xs font-semibold">
                      {user ? roleLabels[user.role] : "User"}
                    </span>
                  </div>
                </div>
                <button
                  className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#9b1c1c] hover:bg-[#ffeded]"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="Account type" value={user ? roleLabels[user.role] : "User"} />
              <StatCard label="Status" value="Active" />
              <StatCard label="Workspace" value="Default" />
            </section>

            <section className="theme-surface rounded-lg border p-6">
              <h2 className="text-lg font-semibold">System Features</h2>
              <p className="theme-muted mt-1 text-sm">Powerful tools to manage your operations efficiently.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                  icon="📊"
                  title="Real-time Dashboard"
                  description="Monitor all operations with live updates and analytics"
                />
                <FeatureCard
                  icon="📅"
                  title="Smart Calendar"
                  description="Interactive month view with event scheduling and reminders"
                />
                <FeatureCard
                  icon="🔔"
                  title="Notifications"
                  description="Instant alerts and email notifications for important events"
                />
                <FeatureCard
                  icon="🔐"
                  title="Role-based Access"
                  description="Secure permissions system with admin controls"
                />
                <FeatureCard
                  icon="🌍"
                  title="Multi-language"
                  description="Support for English and Swahili with easy switching"
                />
                <FeatureCard
                  icon="🎨"
                  title="Theme Customization"
                  description="Switch between light, dark, and auto themes"
                />
                <FeatureCard
                  icon="📈"
                  title="Advanced Reports"
                  description="Generate detailed reports with export options"
                />
                <FeatureCard
                  icon="🔍"
                  title="Smart Search"
                  description="Powerful filtering and search across all modules"
                />
                <FeatureCard
                  icon="💳"
                  title="Payment Integration"
                  description="Multiple payment methods for seamless transactions"
                />
              </div>
            </section>

            <section className="theme-surface rounded-lg border p-6">
              <h2 className="text-lg font-semibold">Preferences</h2>
              <p className="theme-muted mt-1 text-sm">Control how Nafasi looks and behaves for your team.</p>
              <div className="mt-5 grid gap-5">
                <label className="flex items-center justify-between gap-4 rounded-md border border-[var(--app-border)] bg-white px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-[#354039]">
                      Email notifications
                    </span>
                    <span className="theme-muted mt-1 block text-sm">
                      Receive important workspace updates by email.
                    </span>
                  </span>
                  <input
                    checked={preferences.emailNotifications}
                    className="h-4 w-4"
                    onChange={(event) => handlePreferenceChange("emailNotifications", event.target.checked)}
                    type="checkbox"
                  />
                </label>

                <div className="border-t border-[var(--app-border)] pt-4">
                  <ThemePicker
                    onChange={(theme) => handlePreferenceChange("theme", theme)}
                    value={preferences.theme}
                  />
                </div>

                <div className="border-t border-[var(--app-border)] pt-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                      Language
                    </span>
                    <select
                      aria-label="Select language"
                      className="form-input"
                      onChange={(event) => handlePreferenceChange("language", event.target.value)}
                      value={preferences.language}
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <section className="theme-surface rounded-lg border p-6">
              <h2 className="text-lg font-semibold">Payment methods</h2>
              <p className="theme-muted mt-1 text-sm">Add and manage your preferred payment methods for transactions.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <PaymentMethodCard
                  icon="📱"
                  title="M-Pesa"
                  description="Mobile money transfer via Safaricom"
                />
                <PaymentMethodCard
                  icon="💳"
                  title="Airtel Money"
                  description="Mobile money via Airtel"
                />
                <PaymentMethodCard
                  icon="🏦"
                  title="Card"
                  description="Credit or debit card"
                />
              </div>
            </section>

            <section className="theme-surface rounded-lg border p-6">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  className="theme-accent rounded-md px-4 py-3 text-center text-sm font-semibold"
                  href="/dashboard"
                >
                  Go to dashboard
                </Link>
                <Link
                  className="rounded-md border border-[var(--app-border)] bg-white px-4 py-3 text-center text-sm font-semibold theme-accent-text hover:bg-[#f3f4f0]"
                  href="/help"
                >
                  Get help
                </Link>
              </div>
            </section>

            <section className="theme-surface rounded-lg border p-6">
              <h3 className="font-semibold theme-accent-text">Need help?</h3>
              <p className="theme-muted mt-2 text-sm">
                Check our documentation or contact support if you have questions about your account or features.
              </p>
              <Link
                className="mt-3 inline-block text-sm font-semibold theme-accent-text hover:underline"
                href="/help"
              >
                Contact support
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="theme-surface rounded-lg border p-4">
      <p className="theme-muted text-xs font-semibold uppercase tracking-widest">{label}</p>
      <p className="mt-2 text-lg font-semibold theme-accent-text">{value}</p>
    </article>
  );
}

function PaymentMethodCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const bgColors: Record<string, string> = {
    "M-Pesa": "bg-emerald-50 hover:bg-emerald-100",
    "Airtel Money": "bg-rose-50 hover:bg-rose-100",
    "Card": "bg-sky-50 hover:bg-sky-100",
  };

  const borderColors: Record<string, string> = {
    "M-Pesa": "border-emerald-200 hover:border-emerald-300",
    "Airtel Money": "border-rose-200 hover:border-rose-300",
    "Card": "border-sky-200 hover:border-sky-300",
  };

  const textColors: Record<string, string> = {
    "M-Pesa": "text-emerald-700",
    "Airtel Money": "text-rose-700",
    "Card": "text-sky-700",
  };

  return (
    <button
      className={`${bgColors[title]} ${borderColors[title]} rounded-lg border p-5 transition-all duration-300 hover:shadow-md active:scale-95 cursor-pointer text-left group`}
      type="button"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`${textColors[title]} font-semibold text-sm`}>{title}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>
          <div className={`${textColors[title]} text-xs font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1`}>
            Setup now
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const featureColors: Record<string, { bg: string; border: string; text: string }> = {
    "📊": { bg: "bg-purple-50 hover:bg-purple-100", border: "border-purple-200 hover:border-purple-300", text: "text-purple-700" },
    "📅": { bg: "bg-blue-50 hover:bg-blue-100", border: "border-blue-200 hover:border-blue-300", text: "text-blue-700" },
    "🔔": { bg: "bg-orange-50 hover:bg-orange-100", border: "border-orange-200 hover:border-orange-300", text: "text-orange-700" },
    "🔐": { bg: "bg-red-50 hover:bg-red-100", border: "border-red-200 hover:border-red-300", text: "text-red-700" },
    "🌍": { bg: "bg-green-50 hover:bg-green-100", border: "border-green-200 hover:border-green-300", text: "text-green-700" },
    "🎨": { bg: "bg-pink-50 hover:bg-pink-100", border: "border-pink-200 hover:border-pink-300", text: "text-pink-700" },
    "📈": { bg: "bg-cyan-50 hover:bg-cyan-100", border: "border-cyan-200 hover:border-cyan-300", text: "text-cyan-700" },
    "🔍": { bg: "bg-indigo-50 hover:bg-indigo-100", border: "border-indigo-200 hover:border-indigo-300", text: "text-indigo-700" },
    "💳": { bg: "bg-emerald-50 hover:bg-emerald-100", border: "border-emerald-200 hover:border-emerald-300", text: "text-emerald-700" },
  };

  const colors = featureColors[icon] || { bg: "bg-gray-50 hover:bg-gray-100", border: "border-gray-200 hover:border-gray-300", text: "text-gray-700" };

  return (
    <div
      className={`${colors.bg} ${colors.border} rounded-lg border p-4 transition-all duration-300 hover:shadow-md cursor-pointer group`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`${colors.text} font-semibold text-sm`}>{title}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function readStoredPreferences(): SetupPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences();
  }

  const stored = window.localStorage.getItem("nafasi_preferences");
  const base = stored ? { ...defaultPreferences(), ...JSON.parse(stored) } : defaultPreferences();
  return {
    ...base,
    theme: readSelectedTheme(base.theme),
  };
}

function defaultPreferences(): SetupPreferences {
  return { emailNotifications: true, language: "en", theme: defaultThemeKey };
}

function saveTheme(theme: ThemeKey, user: AuthUser | null) {
  const accountKey = accountThemeStorageKey(accountIdForUser(user));

  if (accountKey) {
    window.localStorage.setItem(accountKey, theme);
  } else {
    window.localStorage.setItem(globalThemeStorageKey, theme);
  }

  applyTheme(theme);
  window.dispatchEvent(new Event(themeStorageEvent));
}

function readSelectedTheme(fallback: ThemeKey) {
  const accountKey = accountThemeStorageKey(accountIdForUser(readStoredUser()));
  const accountTheme = accountKey ? window.localStorage.getItem(accountKey) : null;
  const globalTheme = window.localStorage.getItem(globalThemeStorageKey);
  return getThemeByKey(accountTheme ?? globalTheme ?? fallback).key;
}

function accountIdForUser(user: AuthUser | null) {
  return user?.email ?? user?.name ?? null;
}
