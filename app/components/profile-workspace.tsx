"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { clearSession, roleLabels, type AuthUser } from "@/app/lib/auth";
import { defaultFeature } from "@/app/lib/features";

export default function ProfileWorkspace() {
  const [user] = useState<AuthUser | null>(() => readStoredUser());

  function handleSignOut() {
    clearSession();
    window.location.href = "/home";
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Navbar activeFeature={defaultFeature} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Sidebar activeFeature={defaultFeature} />
        <main className="min-w-0 flex-1">
          <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Account profile</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
              Manage your Nafasi identity and jump back into your workspace.
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-[#e1e5db] bg-white p-5">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1d3d35] text-xl font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase() ?? "N"}
                </div>
                <h2 className="mt-4 text-xl font-semibold">{user?.name ?? "Nafasi user"}</h2>
                <p className="mt-1 text-sm text-[#5d665d]">{user?.email ?? "No active session found"}</p>
                <p className="mt-3 inline-flex rounded-md bg-[#eef5df] px-3 py-1 text-sm font-semibold text-[#1d3d35]">
                  {user ? roleLabels[user.role] : "Guest"}
                </p>
              </div>

              <div className="rounded-lg border border-[#e1e5db] bg-white p-5">
                <h2 className="text-lg font-semibold">Account actions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    className="rounded-md bg-[#1d3d35] px-4 py-3 text-center text-sm font-semibold text-white"
                    href="/dashboard"
                  >
                    Open dashboard
                  </Link>
                  <Link
                    className="rounded-md border border-[#b9c3b2] bg-white px-4 py-3 text-center text-sm font-semibold text-[#1d3d35]"
                    href="/account"
                  >
                    Account settings
                  </Link>
                </div>
                <button
                  className="mt-4 w-full rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#9b1c1c]"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nafasi_user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}
