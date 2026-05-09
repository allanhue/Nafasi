"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { clearSession } from "@/app/lib/auth";
import type { AuthUser } from "@/app/lib/auth";
import { getFeatureSections, type Feature } from "@/app/lib/features";
import { useSidebar } from "./sidebar_context";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  getIconForSection,
  HelpIcon,
  PencilIcon,
  SettingsIcon,
} from "./sidebar_icons";

type SidebarProps = {
  activeFeature: Feature;
};

export default function Sidebar({ activeFeature }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const menu = getFeatureSections(activeFeature);
  const [showEditModal, setShowEditModal] = useState(false);
  const [workspaceImage, setWorkspaceImage] = useState<string | null>(() =>
    readWorkspaceImage(activeFeature.key)
  );
  const [user] = useState<AuthUser | null>(() => readStoredUser());

  const isAdmin = user?.role === "system_admin" || user?.role === "admin";
  const settingsPath = isAdmin ? "/settings" : "/setup";

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "5rem" : "16rem"
    );
  }, [isCollapsed]);

  function handleSignOut() {
    clearSession();
    router.push("/home");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : null;
      setWorkspaceImage(value);
      if (value) {
        window.localStorage.setItem(workspaceImageKey(activeFeature.key), value);
      }
    };
    reader.readAsDataURL(file);
  }

  function removeWorkspaceImage() {
    setWorkspaceImage(null);
    window.localStorage.removeItem(workspaceImageKey(activeFeature.key));
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-[#d8ddd0] bg-[#fbfcf8] shadow-sm transition-all duration-300 lg:block overflow-y-auto ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className={`border-b border-[#e3e6dc] px-4 pb-4 pt-4 transition-all duration-300 ${isCollapsed ? "text-center" : ""}`}>
            <div className="relative group flex justify-center">
              <button
                onClick={() => setShowEditModal(true)}
                className="group/icon relative flex items-center justify-center"
                title="Change workspace picture"
              >
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-[#1d3d35] text-sm font-bold text-white">
                  {workspaceImage ? (
                    <span
                      aria-hidden="true"
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${workspaceImage})` }}
                    />
                  ) : (
                    activeFeature.shortLabel.charAt(0)
                  )}
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

          <nav className={`mt-4 ${isCollapsed ? "space-y-2 px-2" : "space-y-1 px-3"}`}>
            {menu.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  className={`grid min-h-10 items-center rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive ? "bg-[#1d3d35] text-white shadow-sm" : "text-[#4b554d] hover:bg-[#edf1e7]"
                  } ${isCollapsed ? "grid-cols-1 justify-items-center" : "grid-cols-[1.25rem_1fr_auto] gap-3"}`}
                  href={item.href}
                  key={item.slug}
                  title={isCollapsed ? item.title : undefined}
                >
                  <span className="grid h-5 w-5 place-items-center">{getIconForSection(item.slug)}</span>
                  {!isCollapsed && (
                    <>
                      <span className="min-w-0 truncate">{item.title}</span>
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
                  <span className="block truncate text-xs text-[#788178]">Account</span>
                </span>
              </Link>
            )}
            <div className={`flex ${isCollapsed ? "flex-col gap-2" : "items-center gap-2"}`}>
              <Link
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === settingsPath ? "bg-[#1d3d35] text-white" : "text-[#4b554d] hover:bg-[#edf1e7]"
                } ${isCollapsed ? "justify-center" : "flex-1"}`}
                href={settingsPath}
                title={isCollapsed ? (isAdmin ? "Settings" : "Setup") : undefined}
              >
                <SettingsIcon />
                {!isCollapsed && <span>{isAdmin ? "Settings" : "Setup"}</span>}
              </Link>
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
            <h2 className="text-xl font-semibold mb-4">Workspace picture</h2>
            <div className="mb-4 flex justify-center">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-lg bg-[#1d3d35] text-3xl font-bold text-white">
                {workspaceImage ? (
                  <span
                    aria-hidden="true"
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${workspaceImage})` }}
                  />
                ) : (
                  activeFeature.shortLabel.charAt(0)
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1d3d35] mb-2">
                Upload image
              </label>
              <input
                accept="image/*"
                className="w-full rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-sm text-[#1d3d35] file:mr-3 file:rounded-md file:border-0 file:bg-[#edf1e7] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#1d3d35]"
                onChange={handleImageChange}
                type="file"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-[#1d3d35] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#0f2419]"
              >
                Done
              </button>
              <button
                onClick={removeWorkspaceImage}
                className="flex-1 bg-[#fff5f5] text-[#9b1c1c] px-4 py-2 rounded-md font-semibold hover:bg-[#fee2e2]"
                type="button"
              >
                Remove
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

function workspaceImageKey(featureKey: string) {
  return `nafasi_workspace_image_${featureKey}`;
}

function readWorkspaceImage(featureKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(workspaceImageKey(featureKey));
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nafasi_user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}
