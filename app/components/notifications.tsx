"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, getStoredToken } from "@/app/lib/auth";
import type { Feature } from "@/app/lib/features";

type NotificationsProps = {
  activeFeature: Feature;
};

type NotificationItem = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  status: "unread" | "read";
  kind: "request" | "system" | "message";
};

export default function Notifications({ activeFeature }: NotificationsProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");

  const unreadCount = items.filter((item) => item.status === "unread").length;

  const loadNotifications = useCallback(async () => {
    setError("");
    const token = getStoredToken();
    if (!token) {
      setError("Sign in again to load notifications.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Handle 404 gracefully - notifications endpoint may not exist yet
        if (response.status === 404) {
          setItems([]);
          return;
        }
        throw new Error(payload.error ?? "Could not load notifications");
      }
      setItems(payload.notifications ?? []);
    } catch (err) {
      // Don't show error if it's just a missing endpoint - show empty state instead
      if (err instanceof Error && err.message.includes("404")) {
        setItems([]);
      } else {
        setError(err instanceof Error ? err.message : "Could not load notifications");
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  async function markAllRead() {
    const token = getStoredToken();
    if (!token) {
      setError("Sign in again to update notifications.");
      return;
    }

    setItems((current) => current.map((item) => ({ ...item, status: "read" })));
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#20231f]">{unreadCount} unread</p>
          <p className="text-xs text-[#677067]">{activeFeature.label} workspace updates</p>
        </div>
        <button
          className="rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-xs font-semibold text-[#1d3d35] hover:bg-[#edf1e7]"
          onClick={markAllRead}
          type="button"
        >
          Mark all read
        </button>
      </div>

      {error ? (
        <p className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-3 py-2 text-sm text-[#9b1c1c]">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        {items.length === 0 && !error ? (
          <p className="rounded-lg border border-[#d8ddd0] bg-white p-4 text-sm text-[#5d665d]">
            No notifications yet.
          </p>
        ) : null}
        {items.map((item) => (
          <article
            className="rounded-lg border border-[#d8ddd0] bg-white p-4"
            key={item.id}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  item.status === "unread" ? "bg-[#c2410c]" : "bg-[#cfd6c9]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#20231f]">{item.title}</h3>
                  <span className="shrink-0 text-xs font-medium text-[#788178]">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#5d665d]">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
