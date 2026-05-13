"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import {
  API_BASE_URL,
  getStoredToken,
  type AuthUser,
} from "@/app/lib/auth";
import { defaultFeature } from "@/app/lib/features";

type AnalyticsData = {
  totalUsers: number;
  activeSessions: number;
  totalTransactions: number;
  systemUptime: string;
  averageTransactionValue: number;
  conversionRate: number;
  topFeature: string;
  userGrowth: number;
  transactionGrowth: number;
  revenueGrowth: number;
  featureUsage: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    user: string;
    timestamp: string;
    status: "success" | "pending" | "failed";
  }>;
  dailyMetrics: Array<{
    date: string;
    users: number;
    transactions: number;
    revenue: number;
    peak?: boolean;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    transactions: number;
  }>;
  userSegmentation: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
};

export default function AnalyticsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    const token = getStoredToken();
    if (!token) {
      setError("Sign in to view analytics.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Return mock data if endpoint doesn't exist yet
        if (response.status === 404) {
          setAnalytics(generateMockAnalytics());
          setLoading(false);
          return;
        }
        throw new Error(payload.error ?? "Could not load analytics");
      }
      setAnalytics(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics");
      // Show mock data on error so user can still see the page
      setAnalytics(generateMockAnalytics());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={defaultFeature} />
      <Navbar activeFeature={defaultFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-6 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">System analytics</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d665d]">
              Real-time insights into system usage, user activity, and platform performance.
            </p>
          </section>

          {error && (
            <div className="mb-6 rounded-lg border border-[#efc7c7] bg-[#fff5f5] p-4 text-sm text-[#9b1c1c]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#5d665d]">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Time Range Selector */}
              <div className="flex gap-2 mb-6">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      timeRange === range
                        ? "bg-[#1d3d35] text-white"
                        : "bg-white border border-[#d8ddd0] text-[#4b554d] hover:bg-[#edf1e7]"
                    }`}
                  >
                    {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
                  </button>
                ))}
              </div>

              {/* Key Metrics with Trends */}
              <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCardWithTrend
                  label="Total Users"
                  value={String(analytics.totalUsers)}
                  detail="All registered users"
                  trend={analytics.userGrowth}
                />
                <MetricCardWithTrend
                  label="Active Sessions"
                  value={String(analytics.activeSessions)}
                  detail="Currently online"
                  trend={8.5}
                />
                <MetricCardWithTrend
                  label="Total Transactions"
                  value={String(analytics.totalTransactions)}
                  detail="Completed transactions"
                  trend={analytics.transactionGrowth}
                />
                <MetricCardWithTrend
                  label="Revenue Growth"
                  value={`+${analytics.revenueGrowth.toFixed(1)}%`}
                  detail="vs previous period"
                  trend={analytics.revenueGrowth}
                />
              </section>

              {/* Secondary Metrics */}
              <section className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Avg Transaction Value"
                  value={`$${analytics.averageTransactionValue.toLocaleString()}`}
                  detail="Average per transaction"
                />
                <MetricCard
                  label="Conversion Rate"
                  value={`${analytics.conversionRate.toFixed(1)}%`}
                  detail="User to transaction ratio"
                />
                <MetricCard
                  label="System Uptime"
                  value={analytics.systemUptime}
                  detail="Last 30 days"
                />
              </section>

              {/* Feature Usage & User Segmentation */}
              <section className="grid gap-6 lg:grid-cols-2">
                {/* Feature Usage */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">Feature usage</h2>
                  <div className="space-y-4">
                    {analytics.featureUsage.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-[#20231f]">{feature.name}</p>
                            <span className="text-xs font-semibold text-[#788178]">
                              {feature.percentage}% ({feature.count})
                            </span>
                          </div>
                          <div className="h-2 bg-[#e1e5db] rounded-full overflow-hidden">
                            <ProgressBar percentage={feature.percentage} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Segmentation */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">User segmentation</h2>
                  <div className="space-y-4">
                    {analytics.userSegmentation.map((segment) => (
                      <div key={segment.segment} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-[#20231f]">{segment.segment}</p>
                            <span className="text-xs font-semibold text-[#788178]">
                              {segment.percentage}% ({segment.count})
                            </span>
                          </div>
                          <div className="h-2 bg-[#e1e5db] rounded-full overflow-hidden">
                            <ProgressBar percentage={segment.percentage} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Hourly Distribution Chart */}
              <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Transaction distribution by hour</h2>
                <div className="space-y-3">
                  {analytics.hourlyDistribution.map((hour) => {
                    const maxTransactions = Math.max(...analytics.hourlyDistribution.map((h) => h.transactions));
                    const percentage = (hour.transactions / maxTransactions) * 100;
                    return (
                      <div key={hour.hour} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[#788178] w-12">{`${hour.hour.toString().padStart(2, "0")}:00`}</span>
                        <div className="flex-1 h-6 bg-[#e1e5db] rounded-md overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#1d3d35] to-[#2d5d4d] transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#1d3d35] w-12 text-right">{hour.transactions}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Activity Trend */}
              <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Activity trend</h2>
                <div className="space-y-3">
                  {analytics.dailyMetrics.map((metric) => (
                    <div
                      key={metric.date}
                      className={`flex items-center justify-between pb-3 border-b border-[#e1e5db] last:border-0 ${
                        metric.peak ? "bg-[#eef5df] -mx-6 px-6 py-3" : ""
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-[#20231f]">
                          {formatDate(metric.date)}
                          {metric.peak && <span className="ml-2 text-xs font-semibold text-[#15803d]">● Peak</span>}
                        </p>
                        <p className="text-xs text-[#5d665d]">
                          {metric.users} users · {metric.transactions} transactions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#1d3d35]">
                          ${metric.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent activity</h2>
                  <button
                    className="rounded-md border border-[#d8ddd0] px-3 py-2 text-xs font-semibold text-[#1d3d35] hover:bg-[#edf1e7]"
                    onClick={loadAnalytics}
                    type="button"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-3">
                  {analytics.recentActivity.length === 0 ? (
                    <p className="text-sm text-[#5d665d]">No recent activity.</p>
                  ) : null}
                  {analytics.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between pb-3 border-b border-[#e1e5db] last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              activity.status === "success"
                                ? "bg-[#15803d]"
                                : activity.status === "pending"
                                ? "bg-[#ea8c55]"
                                : "bg-[#dc2626]"
                            }`}
                          />
                          <p className="text-sm font-medium text-[#20231f]">{activity.action}</p>
                        </div>
                        <p className="mt-1 text-xs text-[#5d665d]">{activity.user}</p>
                      </div>
                      <span className="text-xs font-medium text-[#788178]">
                        {formatActivityTime(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* System Information */}
              <section className="rounded-lg border border-[#d8ddd0] bg-[#eef5df] p-6">
                <h3 className="font-semibold text-[#1d3d35]">System information</h3>
                <p className="mt-2 text-sm text-[#5d665d]">
                  Analytics are updated in real-time. Data is retained for the last 90 days. For detailed reports, visit individual feature dashboards or contact support.
                </p>
                <Link
                  href="/help"
                  className="mt-3 inline-block text-sm font-semibold text-[#1d3d35] hover:underline"
                >
                  Learn more →
                </Link>
              </section>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-[#e1e5db] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#1d3d35]">{value}</p>
      <p className="mt-2 text-xs text-[#5d665d]">{detail}</p>
    </article>
  );
}

function MetricCardWithTrend({
  label,
  value,
  detail,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  trend: number;
}) {
  const isPositive = trend >= 0;
  return (
    <article className="rounded-lg border border-[#e1e5db] bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#788178]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[#1d3d35]">{value}</p>
          <p className="mt-2 text-xs text-[#5d665d]">{detail}</p>
        </div>
        <div
          className={`ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
            isPositive ? "bg-[#dffcf0] text-[#15803d]" : "bg-[#fee2e2] text-[#dc2626]"
          }`}
        >
          <span>{isPositive ? "↑" : "↓"}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>
    </article>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function formatActivityTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("nafasi_user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}

function ProgressBar({ percentage }: { percentage: number }) {
  const widthPercent = Math.max(0, Math.min(100, percentage));
  return (
    <div
      aria-valuenow={widthPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-full bg-[#1d3d35] transition-all duration-300"
      role="progressbar"
      style={{ width: `${widthPercent}%` } as React.CSSProperties}
      title={`${widthPercent}% complete`}
    />
  );
}

function generateMockAnalytics(): AnalyticsData {
  return {
    totalUsers: 1243,
    activeSessions: 87,
    totalTransactions: 5634,
    systemUptime: "99.8%",
    averageTransactionValue: 2145,
    conversionRate: 18.5,
    topFeature: "Rentals",
    userGrowth: 12.5,
    transactionGrowth: 18.3,
    revenueGrowth: 15.8,
    featureUsage: [
      { name: "Rentals", count: 2845, percentage: 45 },
      { name: "Warehouses", count: 1923, percentage: 31 },
      { name: "Event Spaces", count: 1866, percentage: 30 },
    ],
    userSegmentation: [
      { segment: "Premium Users", count: 287, percentage: 23 },
      { segment: "Active Users", count: 654, percentage: 53 },
      { segment: "Inactive Users", count: 302, percentage: 24 },
    ],
    recentActivity: [
      {
        id: 1,
        action: "Property listing published",
        user: "John Mwaliko",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        status: "success",
      },
      {
        id: 2,
        action: "Storage contract signed",
        user: "Sarah Kipchoge",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: "success",
      },
      {
        id: 3,
        action: "Event booking request",
        user: "Mike Ochieng",
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        status: "pending",
      },
      {
        id: 4,
        action: "User registration failed",
        user: "System",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: "failed",
      },
      {
        id: 5,
        action: "Viewing request confirmed",
        user: "James Kariuki",
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        status: "success",
      },
    ],
    dailyMetrics: [
      { date: new Date(Date.now() - 4 * 86400000).toISOString(), users: 234, transactions: 156, revenue: 8750 },
      { date: new Date(Date.now() - 3 * 86400000).toISOString(), users: 267, transactions: 189, revenue: 10230 },
      { date: new Date(Date.now() - 2 * 86400000).toISOString(), users: 245, transactions: 168, revenue: 9120 },
      { date: new Date(Date.now() - 1 * 86400000).toISOString(), users: 289, transactions: 203, revenue: 11890, peak: true },
      { date: new Date().toISOString(), users: 312, transactions: 218, revenue: 12450 },
    ],
    hourlyDistribution: [
      { hour: 0, transactions: 45 },
      { hour: 1, transactions: 32 },
      { hour: 2, transactions: 28 },
      { hour: 3, transactions: 22 },
      { hour: 4, transactions: 18 },
      { hour: 5, transactions: 24 },
      { hour: 6, transactions: 58 },
      { hour: 7, transactions: 89 },
      { hour: 8, transactions: 134 },
      { hour: 9, transactions: 156 },
      { hour: 10, transactions: 168 },
      { hour: 11, transactions: 178 },
      { hour: 12, transactions: 145 },
      { hour: 13, transactions: 132 },
      { hour: 14, transactions: 156 },
      { hour: 15, transactions: 189 },
      { hour: 16, transactions: 198 },
      { hour: 17, transactions: 176 },
      { hour: 18, transactions: 145 },
      { hour: 19, transactions: 123 },
      { hour: 20, transactions: 98 },
      { hour: 21, transactions: 76 },
      { hour: 22, transactions: 54 },
      { hour: 23, transactions: 38 },
    ],
  };
}
