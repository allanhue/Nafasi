"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/auth";
import { getFeatureSections, type Feature } from "@/app/lib/features";

type SidebarProps = {
  activeFeature: Feature;
};

// Icon components
function OverviewIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ListingIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10h8M8 14h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RequestsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApplicationsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContractIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 13.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getIconForSection(slug: string): React.ReactNode {
  switch (slug) {
    case "overview":
      return <OverviewIcon />;
    case "property-listings":
      return <ListingIcon />;
    case "warehouse-listings":
      return <ListingIcon />;
    case "space-listings":
      return <ListingIcon />;
    case "viewing-requests":
      return <RequestsIcon />;
    case "storage-requests":
      return <RequestsIcon />;
    case "space-requests":
      return <RequestsIcon />;
    case "applications":
      return <ApplicationsIcon />;
    case "logistics-support":
      return <RequestsIcon />;
    case "leases":
      return <ContractIcon />;
    case "contracts":
      return <ContractIcon />;
    case "reports":
      return <ReportsIcon />;
    default:
      return <OverviewIcon />;
  }
}

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
                className={`flex w-full items-center gap-3 justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
                }`}
                href={item.href}
                key={item.slug}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0">{getIconForSection(item.slug)}</span>
                  <span>{item.title}</span>
                </div>
                {isActive ? <span className="h-2 w-2 rounded-full bg-[#d9ff72] flex-shrink-0" /> : null}
              </Link>
            );
          })}
          <Link
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/profile" ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
            }`}
            href="/profile"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-current text-xs font-semibold flex-shrink-0">
              P
            </span>
            <span>Profile</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-[#e3e6dc] pt-4">
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#4b554d] hover:bg-[#edf1e7] transition-colors"
            href="/profile"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e4e8dd] text-sm font-semibold text-[#1d3d35] flex-shrink-0">
              N
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[#20231f]">Profile</span>
              <span className="block truncate text-xs text-[#788178]">Account settings</span>
            </span>
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <button
              aria-label="Sign out"
              className="flex-1 flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-[#9b1c1c] hover:bg-[#fff5f5] transition-colors"
              onClick={handleSignOut}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Sign out</span>
            </button>
            <Link
              className="p-2 rounded-md text-[#4b554d] hover:bg-[#edf1e7] transition-colors"
              href="/help"
              title="Help & Support"
            >
              <HelpIcon />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
