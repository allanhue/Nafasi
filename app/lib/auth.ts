import type { UserRole } from "@/app/lib/features";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === "production"   
    ? "https://nafasi-s0ph.onrender.com" 
    : "http://localhost:8080");

// This safely strips the trailing slash if one exists
export const API_BASE_URL = rawUrl.replace(/\/$/, "");


export const roleLabels: Record<UserRole, string> = {
  system_admin: "System admin",
  admin: "Admin",
  provider: "Provider",
  customer: "Customer",
};

export const signUpRoles: UserRole[] = ["customer", "provider"];

export async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload as T;
}

export function saveSession(auth: AuthResponse) {
  window.localStorage.setItem("nafasi_token", auth.token);
  window.localStorage.setItem("nafasi_user", JSON.stringify(auth.user));
  window.localStorage.setItem("nafasi_session_expires_at", auth.expiresAt);
}

export function clearSession() {
  window.localStorage.removeItem("nafasi_token");
  window.localStorage.removeItem("nafasi_user");
  window.localStorage.removeItem("nafasi_session_expires_at");
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("nafasi_token");
}
