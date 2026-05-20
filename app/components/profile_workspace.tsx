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
  signUpRoles,
  type AuthUser,
} from "@/app/lib/auth";
import { defaultFeature, type UserRole } from "@/app/lib/features";

type AccountTab = "overview" | "settings" | "security";

type AuditLog = {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
};

const accountTabs: Array<{ id: AccountTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "settings", label: "System" },
  { id: "security", label: "Security" },
];

const systemRoles: UserRole[] = ["system_admin", "admin", "provider", "customer"];

export default function ProfileWorkspace() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  function handleSignOut() {
    clearSession();
    window.location.href = "/home";
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={defaultFeature} />
      <Navbar activeFeature={defaultFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-6 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">System settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
              Manage your account, workspace access, roles and operational settings.
            </p>
          </section>

          <div className="mb-6 border-b border-[#d8ddd0]">
            <div className="flex gap-1 overflow-x-auto">
              {accountTabs.map((tab) => (
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

          {activeTab === "overview" ? (
            <OverviewPanel onSignOut={handleSignOut} user={user} />
          ) : null}
          {activeTab === "settings" ? <SystemSettingsPanel currentUser={user} /> : null}
          {activeTab === "security" ? <SecurityPanel onSignOut={handleSignOut} /> : null}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel({
  onSignOut,
  user,
}: {
  onSignOut: () => void;
  user: AuthUser | null;
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
              <h2 className="text-2xl font-semibold">{user?.name ?? "Nafasi user"}</h2>
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
        <SummaryCard label="System role" value={user ? roleLabels[user.role] : "Guest"} />
        <SummaryCard label="Workspaces" value="3" />
        <SummaryCard label="Role types" value={String(systemRoles.length)} />
      </section>

      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h3 className="text-lg font-semibold">Quick actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded-md bg-[#1d3d35] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0f2419]"
            href="/dashboard"
          >
            Open dashboard
          </Link>
          <Link
            className="rounded-md border border-[#b9c3b2] bg-white px-4 py-3 text-center text-sm font-semibold text-[#1d3d35] hover:bg-[#f3f4f0]"
            href="/help"
          >
            Contact support
          </Link>
        </div>
      </section>
    </div>
  );
}

function SystemSettingsPanel({ currentUser }: { currentUser: AuthUser | null }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("provider");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canManageUsers = currentUser?.role === "system_admin" || currentUser?.role === "admin";

  useEffect(() => {
    if (canManageUsers) {
      void loadUsers();
      void loadAuditLogs();
    }
  }, [canManageUsers]);

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
      setMessage("User created.");
      void loadAuditLogs();
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
      setMessage("Role updated.");
      void loadAuditLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    }
  }

  async function loadAuditLogs() {
    const token = getStoredToken();
    if (!token) {
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
    }
  }

  if (!canManageUsers) {
    return (
      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h2 className="text-lg font-semibold">System access</h2>
        <p className="mt-3 text-sm leading-6 text-[#5d665d]">
          Only admins can create roles, assign users, and manage advanced system settings.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h2 className="text-lg font-semibold">Create user</h2>
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
              {systemRoles.map((item) => (
                <option key={item} value={item}>
                  {roleLabels[item]}
                </option>
              ))}
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
          <h2 className="text-lg font-semibold">Users and roles</h2>
          <button
            className="rounded-md border border-[#d8ddd0] px-3 py-2 text-xs font-semibold text-[#1d3d35]"
            onClick={loadUsers}
            type="button"
          >
            Refresh
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {users.map((item) => (
            <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#20231f]">{item.name}</h3>
                  <p className="text-sm text-[#5d665d]">{item.email}</p>
                </div>
                <select
                  className="form-input md:max-w-48"
                  onChange={(event) => updateRole(item.id, event.target.value as UserRole)}
                  value={item.role}
                  aria-label={`Change role for ${item.name}`}
                >
                  {systemRoles.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleLabels[roleOption]}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>
      </div>

      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Audit log</h2>
          <button
            className="rounded-md border border-[#d8ddd0] px-3 py-2 text-xs font-semibold text-[#1d3d35]"
            onClick={loadAuditLogs}
            type="button"
          >
            Refresh
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {auditLogs.length === 0 ? (
            <p className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3 text-sm text-[#5d665d]">
              No audit activity yet.
            </p>
          ) : null}
          {auditLogs.map((item) => (
            <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#20231f]">{item.summary}</p>
                  <p className="text-xs text-[#5d665d]">
                    {item.action} · {item.entityType} #{item.entityId}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#788178]">
                  {formatAccountDate(item.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SecurityPanel({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h2 className="text-lg font-semibold">Session controls</h2>
        <p className="mt-2 text-sm leading-6 text-[#5d665d]">
          Sign out when changing devices or after creating admin users.
        </p>
        <button
          className="mt-5 rounded-md border border-[#efc7c7] bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#9b1c1c]"
          onClick={onSignOut}
          type="button"
        >
          Sign out
        </button>
      </section>
      <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
        <h2 className="text-lg font-semibold">Allowed signup roles</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {signUpRoles.map((role) => (
            <span className="rounded-md bg-[#edf1e7] px-3 py-1 text-sm font-semibold text-[#1d3d35]" key={role}>
              {roleLabels[role]}
            </span>
          ))}
        </div>
      </section>
    </div>
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

function formatAccountDate(value: string) {
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
