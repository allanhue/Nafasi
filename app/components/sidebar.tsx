"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/auth";
import { getFeatureSections, type Feature } from "@/app/lib/features";

type SidebarProps = {
  activeFeature: Feature;
};

export default function Sidebar({ activeFeature }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem =
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("item");
  const menu = getFeatureSections(activeFeature);

  function handleSignOut() {
    clearSession();
    router.push("/home");
  }

  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 shrink-0 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-[#e3e6dc] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
            Workspace
          </p>
          <h2 className="mt-2 text-xl font-semibold">{activeFeature.shortLabel}</h2>
          <p className="mt-2 text-sm leading-6 text-[#677067]">{activeFeature.accountFocus}</p>
        </div>

        <nav className="mt-4 space-y-1">
          {menu.map((item) => {
            const isActive =
              item.type === "overview"
                ? pathname === item.href
                : pathname === `${activeFeature.route}/section` &&
                  activeItem === item.slug;

            return (
              <Link
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium ${
                  isActive ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
                }`}
                href={item.href}
                key={item.slug}
              >
                <span>{item.title}</span>
                {isActive ? <span className="h-2 w-2 rounded-full bg-[#d9ff72]" /> : null}
              </Link>
            );
          })}
          <Link
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              pathname === "/profile" ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
            }`}
            href="/profile"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-current text-xs font-semibold">
              P
            </span>
            <span>Profile</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-[#e3e6dc] pt-4">
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#4b554d] hover:bg-[#edf1e7]"
            href="/profile"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e4e8dd] text-sm font-semibold text-[#1d3d35]">
              N
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[#20231f]">Profile</span>
              <span className="block truncate text-xs text-[#788178]">Account settings</span>
            </span>
          </Link>
          <button
            aria-label="Sign out"
            className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-[#9b1c1c] hover:bg-[#fff5f5]"
            onClick={handleSignOut}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 19V5a2 2 0 0 0-2-2h-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
