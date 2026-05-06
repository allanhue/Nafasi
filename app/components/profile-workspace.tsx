"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { clearSession, roleLabels, type AuthUser } from "@/app/lib/auth";
import { defaultFeature } from "@/app/lib/features";

export default function ProfileWorkspace() {
  const [user] = useState<AuthUser | null>(() => readStoredUser());
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "security" | "billing">("overview");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    company: "Your Company",
    bio: "Professional description goes here",
  });

  function handleSignOut() {
    clearSession();
    window.location.href = "/home";
  }

  function handleSaveProfile() {
    // Save profile logic here
    setEditMode(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Navbar activeFeature={defaultFeature} />
      <div className="flex w-full">
        <div className="w-64" /> {/* Spacer for fixed sidebar */}
        <div className="flex-1">
          <main className="px-4 py-5 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
                Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Account settings</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
                Manage your Nafasi account, preferences, and security settings.
              </p>
            </section>

            {/* Tabs */}
            <div className="mb-6 border-b border-[#d8ddd0]">
              <div className="flex space-x-1">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "settings", label: "Settings" },
                  { id: "security", label: "Security" },
                  { id: "billing", label: "Billing" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-[#1d3d35] text-[#1d3d35]"
                        : "border-transparent text-[#5d665d] hover:text-[#1d3d35]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid gap-6">
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-[#1d3d35] text-3xl font-semibold text-white">
                        {user?.name?.charAt(0).toUpperCase() ?? "N"}
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold">{user?.name ?? "Nafasi user"}</h2>
                        <p className="text-sm text-[#5d665d]">{user?.email ?? "No active session"}</p>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex rounded-md bg-[#eef5df] px-3 py-1 text-sm font-semibold text-[#1d3d35]">
                            {user ? roleLabels[user.role] : "Guest"}
                          </span>
                          <span className="inline-flex rounded-md bg-[#d9f0dd] px-3 py-1 text-sm font-semibold text-[#166534]">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="rounded-md bg-[#f3f4f0] px-4 py-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#edf1e7]"
                    >
                      {editMode ? "Cancel" : "Edit"}
                    </button>
                  </div>
                </div>

                {/* Account Summary */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">Account Status</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1d3d35]">Active</p>
                    <p className="mt-1 text-sm text-[#5d665d]">Member since Mar 2024</p>
                  </div>
                  <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">Subscription</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1d3d35]">Premium</p>
                    <p className="mt-1 text-sm text-[#5d665d]">Renews on Jun 15</p>
                  </div>
                  <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">Workspaces</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1d3d35]">3</p>
                    <p className="mt-1 text-sm text-[#5d665d]">Rentals, Warehouses, Spaces</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick actions</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
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
                    <button
                      className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#9b1c1c] hover:bg-[#ffeded]"
                      onClick={handleSignOut}
                      type="button"
                    >
                      Sign out
                    </button>
                    <button className="rounded-md border border-[#d8ddd0] bg-white px-4 py-3 text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]">
                      Download data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="grid gap-6">
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Personal information</h3>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-[#1d3d35] mb-2">Full name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!editMode}
                          className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm disabled:bg-[#f3f4f0]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1d3d35] mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!editMode}
                          className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm disabled:bg-[#f3f4f0]"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-[#1d3d35] mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!editMode}
                          className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm disabled:bg-[#f3f4f0]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1d3d35] mb-2">Company</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          disabled={!editMode}
                          className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm disabled:bg-[#f3f4f0]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d3d35] mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!editMode}
                        rows={3}
                        className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm disabled:bg-[#f3f4f0] resize-none"
                      />
                    </div>
                  </div>
                  {editMode && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className="rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2419]"
                      >
                        Save changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="rounded-md border border-[#d8ddd0] px-4 py-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Preferences */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                      <span className="text-sm text-[#1d3d35]">Receive email notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                      <span className="text-sm text-[#1d3d35]">Receive SMS alerts for urgent issues</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded" />
                      <span className="text-sm text-[#1d3d35]">Share usage data to help improve Nafasi</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                      <span className="text-sm text-[#1d3d35]">Show tips and guided tours</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="grid gap-6">
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Change password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-[#1d3d35] mb-2">Current password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d3d35] mb-2">New password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d3d35] mb-2">Confirm new password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-md border border-[#d8ddd0] px-3 py-2 text-sm" />
                    </div>
                    <button className="rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2419]">
                      Update password
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Active sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-[#d8ddd0] p-4">
                      <div>
                        <p className="text-sm font-semibold text-[#1d3d35]">Chrome on Windows</p>
                        <p className="text-xs text-[#5d665d]">Last active: 2 minutes ago</p>
                      </div>
                      <span className="text-xs font-semibold text-[#166534] bg-[#d9f0dd] px-2 py-1 rounded">Current</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-[#d8ddd0] p-4">
                      <div>
                        <p className="text-sm font-semibold text-[#1d3d35]">Safari on macOS</p>
                        <p className="text-xs text-[#5d665d]">Last active: 3 days ago</p>
                      </div>
                      <button className="text-xs font-semibold text-[#9b1c1c] hover:text-[#7f1d1d]">Sign out</button>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#9b1c1c] hover:bg-[#ffeded]">
                    Sign out from all other sessions
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="grid gap-6">
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Subscription plan</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border-2 border-[#1d3d35] p-4">
                      <p className="text-sm font-semibold text-[#1d3d35]">Premium Plan</p>
                      <p className="mt-2 text-2xl font-bold text-[#1d3d35]">$29<span className="text-sm">/month</span></p>
                      <p className="mt-1 text-xs text-[#5d665d]">Next billing date: June 15, 2026</p>
                      <button className="mt-3 w-full rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2419]">
                        Manage subscription
                      </button>
                    </div>
                    <div className="rounded-lg border border-[#d8ddd0] p-4">
                      <p className="text-sm font-semibold text-[#1d3d35]">Premium Plan includes</p>
                      <ul className="mt-3 space-y-2 text-xs text-[#5d665d]">
                        <li>✓ Unlimited workspaces</li>
                        <li>✓ Priority support</li>
                        <li>✓ Advanced analytics</li>
                        <li>✓ Custom integrations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Payment method</h3>
                  <div className="rounded-lg border border-[#d8ddd0] p-4 mb-4">
                    <p className="text-sm font-semibold text-[#1d3d35]">💳 Visa ending in 4242</p>
                    <p className="text-xs text-[#5d665d] mt-1">Expires 12/2026</p>
                  </div>
                  <button className="rounded-md border border-[#d8ddd0] px-4 py-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]">
                    Update payment method
                  </button>
                </div>

                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h3 className="text-lg font-semibold mb-6">Billing history</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md border border-[#d8ddd0] p-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1d3d35]">May 15, 2026</p>
                        <p className="text-xs text-[#5d665d]">Premium Plan</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1d3d35]">$29.00</p>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-[#d8ddd0] p-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1d3d35]">Apr 15, 2026</p>
                        <p className="text-xs text-[#5d665d]">Premium Plan</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1d3d35]">$29.00</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-md border border-[#d8ddd0] px-4 py-2 text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]">
                    Download all invoices
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
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
