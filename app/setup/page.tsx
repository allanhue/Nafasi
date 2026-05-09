"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import {
  clearSession,
  getStoredToken,
  roleLabels,
  type AuthUser,
} from "@/app/lib/auth";
import { defaultFeature } from "@/app/lib/features";

export default function UserSetup() {
  const [user] = useState<AuthUser | null>(() => readStoredUser());
  const [preferences, setPreferences] = useState<{
    emailNotifications: boolean;
    language: string;
  }>(() => readStoredPreferences());

  function handleSignOut() {
    clearSession();
    window.location.href = "/home";
  }

  function handlePreferenceChange(key: string, value: unknown) {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nafasi_preferences", JSON.stringify(updated));
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={defaultFeature} />
      <Navbar activeFeature={defaultFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="mb-6 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your setup</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
              Configure your account preferences and basic settings.
            </p>
          </section>

          <div className="grid gap-6">
            {/* Profile Card */}
            <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1d3d35] text-2xl font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user?.name ?? "Nafasi user"}</h2>
                    <p className="text-sm text-[#5d665d]">{user?.email ?? "No email"}</p>
                    <span className="mt-1 inline-flex rounded-md bg-[#eef5df] px-3 py-1 text-xs font-semibold text-[#1d3d35]">
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

            {/* Quick Stats */}
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="Account type" value={user ? roleLabels[user.role] : "User"} />
              <StatCard label="Status" value="Active" />
              <StatCard label="Workspace" value="Default" />
            </section>

            {/* Preferences */}
            <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
              <h2 className="text-lg font-semibold">Preferences</h2>
              <div className="mt-5 space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-[#354039]">
                    Enable email notifications
                  </span>
                </label>

                <div className="border-t border-[#e1e5db] pt-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#354039]">Language</span>
                    <select
                      className="form-input"
                      onChange={(e) => handlePreferenceChange("language", e.target.value)}
                      value={preferences.language}
                      aria-label="Select language"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  className="rounded-md bg-[#1d3d35] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0f2419]"
                  href="/dashboard"
                >
                  Go to dashboard
                </Link>
                <Link
                  className="rounded-md border border-[#b9c3b2] bg-white px-4 py-3 text-center text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]"
                  href="/help"
                >
                  Get help
                </Link>
              </div>
            </section>

            {/* Support */}
            <section className="rounded-lg border border-[#d8ddd0] bg-[#eef5df] p-6">
              <h3 className="font-semibold text-[#1d3d35]">Need help?</h3>
              <p className="mt-2 text-sm text-[#5d665d]">
                Check our documentation or contact support if you have questions about your account or features.
              </p>
              <Link
                href="/help"
                className="mt-3 inline-block text-sm font-semibold text-[#1d3d35] hover:underline"
              >
                Contact support →
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
    <article className="rounded-lg border border-[#e1e5db] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#1d3d35]">{value}</p>
    </article>
  );
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nafasi_user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return { emailNotifications: true, language: "en" };
  }

  const stored = window.localStorage.getItem("nafasi_preferences");
  return stored
    ? JSON.parse(stored)
    : { emailNotifications: true, language: "en" };
}
