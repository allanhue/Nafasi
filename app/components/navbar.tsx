"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import LoadingOverlay, { ButtonSpinner } from "@/app/components/loading-overlay";
import { API_BASE_URL, type AuthUser } from "@/app/lib/auth";
import { features, type Feature } from "@/app/lib/features";

type NavbarProps = {
  activeFeature: Feature;
};

type DrawerMode = "notifications" | "help" | null;

export default function Navbar({ activeFeature }: NavbarProps) {
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [user] = useState<AuthUser | null>(() => readStoredUser());

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#d8ddd0] bg-[#fbfcf8]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1d3d35] text-sm font-bold text-white">
              N
            </span>
            <span className="hidden sm:block">
              <span className="block text-base font-semibold leading-5">Nafasi</span>
              <span className="block text-xs text-[#677067]">{activeFeature.label} workspace</span>
            </span>
          </Link>

          <label className="relative hidden min-w-0 flex-1 md:block">
            <span className="sr-only">Search Nafasi</span>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#788178]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="7" />
            </svg>
            <input
              className="h-10 w-full rounded-md border border-[#d8ddd0] bg-white pl-10 pr-3 text-sm text-[#20231f] shadow-sm placeholder:text-[#8b9488]"
              placeholder="Search listings, bookings, requests..."
              type="search"
            />
          </label>

          <nav className="hidden items-center gap-1 text-sm font-medium text-[#677067] xl:flex">
            <Link className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]" href="/dashboard">
              Dashboard
            </Link>
            {features.map((feature) => (
              <Link
                className="rounded-md px-3 py-2 hover:bg-[#edf1e7] hover:text-[#20231f]"
                href={feature.route}
                key={feature.key}
              >
                {feature.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              aria-label="Open notifications"
              className="relative grid h-10 w-10 place-items-center rounded-md border border-[#d8ddd0] bg-white text-[#4b554d] hover:bg-[#edf1e7]"
              onClick={() => setDrawerMode("notifications")}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c2410c]" />
            </button>
            <button
              aria-label="Open help"
              className="grid h-10 w-10 place-items-center rounded-md border border-[#d8ddd0] bg-white text-[#4b554d] hover:bg-[#edf1e7]"
              onClick={() => setDrawerMode("help")}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.75 9a2.5 2.5 0 1 1 4.1 1.93c-.91.67-1.85 1.21-1.85 2.57" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link
              aria-label="Open profile"
              className="flex h-10 items-center gap-2 rounded-md border border-[#d8ddd0] bg-white px-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#edf1e7]"
              href="/profile"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1d3d35] text-xs text-white">
                {user?.name?.charAt(0).toUpperCase() ?? "N"}
              </span>
              <span className="hidden max-w-28 truncate lg:block">{user?.name ?? "Profile"}</span>
            </Link>
          </div>
        </div>
      </header>

      <RightDrawer
        mode={drawerMode}
        onClose={() => setDrawerMode(null)}
      />
    </>
  );
}

function RightDrawer({
  mode,
  onClose,
}: {
  mode: DrawerMode;
  onClose: () => void;
}) {
  const isOpen = mode !== null;
  const title = mode === "help" ? "Help center" : "Notifications";
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/mail/help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issue }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send help request");
      }
      setIssue("");
      setMessage("Help request sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send help request");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-40 transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <button
        aria-label="Close drawer"
        className={`absolute inset-0 bg-[#20231f]/20 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-[#d8ddd0] bg-[#fbfcf8] shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#d8ddd0] px-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-md border border-[#d8ddd0] bg-white text-[#4b554d]"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18" strokeLinecap="round" />
              <path d="m6 6 12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="relative space-y-3 p-5">
          {mode === "help" ? (
            <form className="space-y-4" onSubmit={handleHelpSubmit}>
              <label className="block">
                <span className="sr-only">Explain your issue</span>
                <textarea
                  className="min-h-44 w-full resize-none rounded-md border border-[#cfd6c9] bg-white px-3 py-3 text-sm leading-6 text-[#20231f] placeholder:text-[#8b9488]"
                  onChange={(event) => setIssue(event.target.value)}
                  placeholder="Explain the issue..."
                  required
                  value={issue}
                />
              </label>
              {message ? (
                <p className="rounded-md border border-[#b8d6b8] bg-[#f2fbf2] px-3 py-2 text-sm text-[#225522]">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-3 py-2 text-sm text-[#9b1c1c]">
                  {error}
                </p>
              ) : null}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending}
                type="submit"
              >

                {isSending ? "Sending..." : "Send"}
              </button>
            </form>
          ) : (
            <>
              <DrawerCard title="Account ready" body="Your role permissions are active for the available workspaces." />
              <DrawerCard title="Feature routes updated" body="Rentals, warehouses, and spaces now open section pages from the sidebar." />
              <DrawerCard title="API activity" body="Backend requests now log method, path, status, and duration in the Go terminal." />
            </>
          )}
          <LoadingOverlay isLoading={isSending} label="Sending..." />
        </div>
      </aside>
    </div>
  );
}

function DrawerCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-lg border border-[#d8ddd0] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#20231f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5d665d]">{body}</p>
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
