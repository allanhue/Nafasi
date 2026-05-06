"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearSession } from "@/app/lib/auth";
import { getFeatureSections, type Feature } from "@/app/lib/features";
import { useSidebar } from "./sidebar_context";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  getIconForSection,
  HelpIcon,
  PencilIcon,
} from "./sidebar_icons";

type SidebarProps = {
  activeFeature: Feature;
};

export default function Sidebar({ activeFeature }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const activeItem =
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("item");
  const menu = getFeatureSections(activeFeature);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIcon, setEditIcon] = useState(activeFeature.shortLabel.charAt(0));

  if (typeof window !== "undefined") {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "5rem" : "16rem"
    );
  }

  function handleSignOut() {
    clearSession();
    router.push("/home");
  }

  function handleSaveIcon() {
    setShowEditModal(false);
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 hidden h-screen border-r border-[#d8ddd0] bg-[#fbfcf8] transition-all duration-300 lg:block overflow-y-auto ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col pt-16">
          <div className={`border-b border-[#e3e6dc] pb-4 px-4 transition-all duration-300 ${isCollapsed ? "text-center" : ""}`}>
            <div className="relative group">
              <button
                onClick={() => setShowEditModal(true)}
                className="group/icon relative flex items-center justify-center mx-auto"
                title="Edit workspace icon"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1d3d35] text-sm font-bold text-white">
                  {editIcon}
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#1d3d35]/80 opacity-0 group-hover/icon:opacity-100 transition-opacity">
                  <PencilIcon />
                </div>
              </button>
            </div>
            {!isCollapsed && (
              <>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
                  Workspace
                </p>
                <h2 className="mt-1 text-lg font-semibold truncate">{activeFeature.shortLabel}</h2>
                <p className="mt-2 text-xs leading-5 text-[#677067] line-clamp-2">{activeFeature.accountFocus}</p>
              </>
            )}
          </div>

          <nav className={`mt-4 ${isCollapsed ? "space-y-2 px-2" : "space-y-1 px-0"}`}>
            {menu.map((item) => {
              const isActive =
                item.type === "overview"
                  ? pathname === item.href
                  : pathname === `${activeFeature.route}/section` &&
                    activeItem === item.slug;

              return (
                <Link
                  className={`flex items-center gap-3 justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  href={item.href}
                  key={item.slug}
                  title={isCollapsed ? item.title : undefined}
                >
                  <span className="flex-shrink-0">{getIconForSection(item.slug)}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {isActive && <span className="h-2 w-2 rounded-full bg-[#d9ff72] flex-shrink-0" />}
                    </>
                  )}
                </Link>
              );
            })}
            <Link
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/profile" ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
              } ${isCollapsed ? "justify-center" : ""}`}
              href="/profile"
              title={isCollapsed ? "Profile" : undefined}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs font-semibold flex-shrink-0">
                P
              </span>
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </nav>

          <div className={`mt-auto border-t border-[#e3e6dc] pt-4 px-2 transition-all duration-300`}>
            {!isCollapsed && (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#4b554d] hover:bg-[#edf1e7] transition-colors mb-3"
                href="/profile"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e4e8dd] text-xs font-semibold text-[#1d3d35] flex-shrink-0">
                  N
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[#20231f] text-xs">Profile</span>
                  <span className="block truncate text-xs text-[#788178]">Settings</span>
                </span>
              </Link>
            )}
            <div className={`flex ${isCollapsed ? "flex-col gap-2" : "items-center gap-2"}`}>
              <button
                aria-label="Sign out"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-[#9b1c1c] hover:bg-[#fff5f5] transition-colors ${
                  isCollapsed ? "justify-center w-full" : "flex-1"
                }`}
                onClick={handleSignOut}
                type="button"
                title={isCollapsed ? "Sign out" : undefined}
              >
                <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 19V5a2 2 0 0 0-2-2h-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {!isCollapsed && <span>Sign out</span>}
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

          <div className="px-2 py-4 border-t border-[#e3e6dc]">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-md text-[#4b554d] hover:bg-[#edf1e7] transition-colors"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          </div>
        </div>
      </aside>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center lg:ml-0">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Workspace Icon</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1d3d35] mb-2">
                Icon Character (1 character)
              </label>
              <input
                type="text"
                maxLength={1}
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-[#d8ddd0] rounded-md focus:ring-2 focus:ring-[#1d3d35] focus:border-transparent outline-none"
                placeholder="N"
              />
            </div>
            <div className="flex justify-center mb-6">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#1d3d35] text-2xl font-bold text-white">
                {editIcon}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveIcon}
                className="flex-1 bg-[#1d3d35] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#0f2419]"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-[#edf1e7] text-[#1d3d35] px-4 py-2 rounded-md font-semibold hover:bg-[#d8ddd0]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
