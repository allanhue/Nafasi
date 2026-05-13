"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import {
  API_BASE_URL,
  clearSession,
  getStoredToken,
  roleLabels,
  type AuthUser,
} from "@/app/lib/auth";
import { defaultFeature, type UserRole } from "@/app/lib/features";

type SettingsTab = "overview" | "users" | "security" | "audit";

type AuditLog = {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
};

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users & Roles" },
  { id: "security", label: "Security" },
  { id: "audit", label: "Audit log" },
];

const systemRoles: UserRole[] = ["system_admin", "admin", "provider", "customer"];

export default function AdminSettings() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");

  useEffect(() => {
    setUser(readStoredUser());
  }, []);
  const canAccess = user?.role === "system_admin" || user?.role === "admin";

  function handleSignOut() {
    clearSession();
    window.location.href = "/home";
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
        <Sidebar activeFeature={defaultFeature} />
        <Navbar activeFeature={defaultFeature} />
        <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6">
              <h1 className="text-2xl font-semibold text-[#9b1c1c]">Access Denied</h1>
              <p className="mt-2 text-[#5d665d]">
                Only system administrators can access this settings page.
              </p>
              <Link href="/setup" className="mt-4 inline-block text-blue-600 hover:underline">
                Go to user setup →
              </Link>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={defaultFeature} />
      <Navbar activeFeature={defaultFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-6 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">System settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
              Advanced system configuration, user management, security, and operational audit logs.
            </p>
          </section>

          <div className="mb-6 border-b border-[#d8ddd0]">
            <div className="flex gap-1 overflow-x-auto">
              {settingsTabs.map((tab) => (
                <button
                  className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-[#1d3d35] text-[#1d3d35]"
                      : "border-transparent text-[#5d665d] hover:text-[#1d3d35]"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <OverviewPanel onSignOut={handleSignOut} user={user} systemRoles={systemRoles} />
          )}
          {activeTab === "users" && <UsersAndRolesPanel currentUser={user} />}
          {activeTab === "security" && <SecurityPanel onSignOut={handleSignOut} />}
          {activeTab === "audit" && <AuditPanel currentUser={user} />}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel({
  onSignOut,
  user,
  systemRoles,
}: {
  onSignOut: () => void;
  user: AuthUser | null;
  systemRoles: UserRole[];
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[#1d3d35] text-3xl font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() ?? "N"}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user?.name ?? "Nafasi admin"}</h2>
              <p className="text-sm text-[#5d665d]">{user?.email ?? "No active session"}</p>
              <span className="mt-2 inline-flex rounded-md bg-[#eef5df] px-3 py-1 text-sm font-semibold text-[#1d3d35]">
                {user ? roleLabels[user.role] : "Guest"}
              </span>
            </div>
          </div>
          <button
            className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#9b1c1c] hover:bg-[#ffeded]"
            onClick={onSignOut}
            type="button"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Your role" value={user ? roleLabels[user.role] : "Guest"} />
        <SummaryCard label="Total roles" value={String(systemRoles.length)} />
        <SummaryCard label="System access" value="Full" />
      </section>

      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h3 className="text-lg font-semibold">Admin controls</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            className="rounded-md bg-[#1d3d35] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0f2419]"
            href="/dashboard"
          >
            Dashboard
          </a>
          <a
            className="rounded-md border border-[#b9c3b2] bg-white px-4 py-3 text-center text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]"
            href="/help"
          >
            Contact support
          </a>
        </div>
      </section>
    </div>
  );
}

function UsersAndRolesPanel({ currentUser }: { currentUser: AuthUser | null }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("provider");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setError("");
    const token = getStoredToken();
    if (!token) {
      setError("Sign in again to manage users.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load users");
      }
      setUsers(payload.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users");
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const token = getStoredToken();
    if (!token) {
      setError("Sign in again to create users.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not create user");
      }
      setUsers((current) => [payload.user, ...current]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("provider");
      setMessage("User created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create user");
    }
  }

  async function updateRole(userID: number, nextRole: UserRole) {
    setMessage("");
    setError("");
    const token = getStoredToken();
    if (!token) {
      setError("Sign in again to update roles.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userID}/role`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update role");
      }
      setUsers((current) => current.map((item) => (item.id === userID ? payload.user : item)));
      setMessage("Role updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
          <h2 className="text-lg font-semibold">Create new user</h2>
          <form className="mt-5 grid gap-4" onSubmit={handleCreateUser}>
            <TextInput label="Name" onChange={setName} value={name} />
            <TextInput label="Email" onChange={setEmail} type="email" value={email} />
            <TextInput label="Temporary password" onChange={setPassword} type="password" value={password} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#354039]">Role</span>
              <select
                className="form-input"
                onChange={(event) => setRole(event.target.value as UserRole)}
                value={role}
                aria-label="Select user role"
              >
                <option value="provider">{roleLabels["provider"]}</option>
                <option value="customer">{roleLabels["customer"]}</option>
                <option value="admin">{roleLabels["admin"]}</option>
              </select>
            </label>
            <button className="rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white" type="submit">
              Create user
            </button>
            {message ? <StatusMessage tone="success" value={message} /> : null}
            {error ? <StatusMessage tone="error" value={error} /> : null}
          </form>
        </section>

        <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Users ({users.length})</h2>
            <button
              className="rounded-md border border-[#d8ddd0] px-3 py-2 text-xs font-semibold text-[#1d3d35]"
              onClick={loadUsers}
              type="button"
            >
              Refresh
            </button>
          </div>
          <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-sm text-[#5d665d]">No users created yet.</p>
            ) : null}
            {users.map((item) => (
              <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#20231f]">{item.name}</h3>
                    <p className="text-xs text-[#5d665d]">{item.email}</p>
                  </div>
                  <select
                    className="form-input md:max-w-40 text-sm"
                    onChange={(event) => updateRole(item.id, event.target.value as UserRole)}
                    value={item.role}
                    aria-label={`Change role for ${item.name}`}
                  >
                    <option value="provider">{roleLabels["provider"]}</option>
                    <option value="customer">{roleLabels["customer"]}</option>
                    <option value="admin">{roleLabels["admin"]}</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SecurityPanel({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h2 className="text-lg font-semibold">Session security</h2>
        <p className="mt-2 text-sm leading-6 text-[#5d665d]">
          Sign out to end your admin session. Always sign out when leaving your device.
        </p>
        <button
          className="mt-5 rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#9b1c1c]"
          onClick={onSignOut}
          type="button"
        >
          Sign out now
        </button>
      </section>

      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h2 className="text-lg font-semibold">Security settings</h2>
        <p className="mt-3 text-sm text-[#5d665d]">
          System security features and audit logging are enabled for all administrative actions.
        </p>
      </section>
    </div>
  );
}

function AuditPanel({ currentUser }: { currentUser: AuthUser | null }) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadAuditLogs();
  }, []);

  async function loadAuditLogs() {
    setLoading(true);
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        setAuditLogs(payload.auditLogs ?? []);
      }
    } catch {
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">System audit log</h2>
        <button
          className="rounded-md border border-[#d8ddd0] px-3 py-2 text-xs font-semibold text-[#1d3d35]"
          onClick={loadAuditLogs}
          type="button"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <div className="mt-5 space-y-2">
        {auditLogs.length === 0 ? (
          <p className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3 text-sm text-[#5d665d]">
            No audit activity recorded yet.
          </p>
        ) : null}
        {auditLogs.map((item) => (
          <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#20231f]">{item.summary}</p>
                <p className="text-xs text-[#5d665d]">
                  {item.action} · {item.entityType} #{item.entityId}
                </p>
              </div>
              <span className="text-xs font-medium text-[#788178]">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-[#e1e5db] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1d3d35]">{value}</p>
    </article>
  );
}

function TextInput({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#354039]">{label}</span>
      <input
        className="form-input"
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </label>
  );
}

function StatusMessage({ tone, value }: { tone: "success" | "error"; value: string }) {
  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${
        tone === "success"
          ? "border-[#b8d6b8] bg-[#f2fbf2] text-[#225522]"
          : "border-[#efc7c7] bg-[#fff5f5] text-[#9b1c1c]"
      }`}
    >
      {value}
    </p>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nafasi_user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}
