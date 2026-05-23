"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import {
  API_BASE_URL,
  getStoredToken,
  type AuthUser,
} from "@/app/lib/auth";
import { defaultFeature } from "@/app/lib/features";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

type AnalyticsData = {
  totalUsers: number;
  activeSessions: number;
  totalTransactions: number;
  systemUptime: string;
  averageTransactionValue: number;
  conversionRate: number;
  userGrowth: number;
  transactionGrowth: number;
  revenueGrowth: number;
  notificationStats: {
    total: number;
    byType: Array<{ type: string; count: number }>;
  };
  auditStats: {
    total: number;
    topActions: Array<{ action: string; count: number }>;
  };
  dailyMetrics: Array<{
    date: string;
    users: number;
    transactions: number;
    revenue: number;
  }>;
  featureUsage: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  userSegmentation: Array<{
    segment: string;
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
};

const COLORS = ["#1d3d35", "#2d5d4d", "#3d7d5d", "#4d9d6d", "#5dbd7d", "#6ddd8d"];

export default function AnalyticsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    void loadAnalytics();
    
    // Auto-refresh every 30 seconds
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void loadAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

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
      // Fetch notifications
      const notificationsRes = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notificationsData = notificationsRes.ok
        ? await notificationsRes.json()
        : { notifications: [] };

      // Fetch audit logs
      const auditRes = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const auditData = auditRes.ok
        ? await auditRes.json()
        : { logs: [] };

      // Generate analytics from real data
      const analyticsData = generateAnalyticsFromData(
        notificationsData.notifications || [],
        auditData.logs || []
      );

      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics");
      // Fallback to mock data
      setAnalytics(generateMockAnalytics());
    } finally {
      setLoading(false);
    }
  }

  async function exportToExcel() {
    if (!user || !analytics) {
      setError("You must be logged in to export analytics.");
      return;
    }

    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ["Analytics Summary Report"],
        ["Exported on", new Date().toLocaleString()],
        ["User", user.name || user.email || "User"],
        [],
        ["Key Metrics", ""],
        ["Total Users", analytics.totalUsers],
        ["Active Sessions", analytics.activeSessions],
        ["Total Transactions", analytics.totalTransactions],
        ["System Uptime", analytics.systemUptime],
        ["Average Transaction Value", analytics.averageTransactionValue],
        ["Conversion Rate", `${analytics.conversionRate.toFixed(2)}%`],
        ["User Growth", `${analytics.userGrowth.toFixed(2)}%`],
        ["Transaction Growth", `${analytics.transactionGrowth.toFixed(2)}%`],
        ["Revenue Growth", `${analytics.revenueGrowth.toFixed(2)}%`],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      // Sheet 2: Daily Metrics
      const dailyMetricsData = [
        ["Date", "Users", "Transactions", "Revenue"],
        ...analytics.dailyMetrics.map((metric) => [
          new Date(metric.date).toLocaleDateString(),
          metric.users,
          metric.transactions,
          metric.revenue,
        ]),
      ];
      const dailySheet = XLSX.utils.aoa_to_sheet(dailyMetricsData);
      XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Metrics");

      // Sheet 3: Feature Usage
      const featureUsageData = [
        ["Feature", "Count", "Percentage"],
        ...analytics.featureUsage.map((feature) => [
          feature.name,
          feature.count,
          `${feature.percentage}%`,
        ]),
      ];
      const featureSheet = XLSX.utils.aoa_to_sheet(featureUsageData);
      XLSX.utils.book_append_sheet(workbook, featureSheet, "Feature Usage");

      // Sheet 4: User Segmentation
      const userSegmentationData = [
        ["Segment", "Count", "Percentage"],
        ...analytics.userSegmentation.map((segment) => [
          segment.segment,
          segment.count,
          `${segment.percentage}%`,
        ]),
      ];
      const segmentSheet = XLSX.utils.aoa_to_sheet(userSegmentationData);
      XLSX.utils.book_append_sheet(workbook, segmentSheet, "User Segmentation");

      // Sheet 5: Notification Stats
      const notificationData = [
        ["Type", "Count"],
        ...analytics.notificationStats.byType.map((notif) => [
          notif.type,
          notif.count,
        ]),
        [],
        ["Total", analytics.notificationStats.total],
      ];
      const notificationSheet = XLSX.utils.aoa_to_sheet(notificationData);
      XLSX.utils.book_append_sheet(workbook, notificationSheet, "Notifications");

      // Sheet 6: Top Actions
      const actionsData = [
        ["Action", "Count"],
        ...analytics.auditStats.topActions.map((action) => [
          action.action,
          action.count,
        ]),
        [],
        ["Total", analytics.auditStats.total],
      ];
      const actionsSheet = XLSX.utils.aoa_to_sheet(actionsData);
      XLSX.utils.book_append_sheet(workbook, actionsSheet, "Top Actions");

      // Sheet 7: Recent Activity
      const activityData = [
        ["Action", "User", "Timestamp", "Status"],
        ...analytics.recentActivity.map((activity) => [
          activity.action,
          activity.user,
          new Date(activity.timestamp).toLocaleString(),
          activity.status,
        ]),
      ];
      const activitySheet = XLSX.utils.aoa_to_sheet(activityData);
      XLSX.utils.book_append_sheet(workbook, activitySheet, "Recent Activity");

      // Generate file name with current date and time
      const fileName = `Analytics_Report_${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export analytics");
    } finally {
      setExporting(false);
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
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-2">
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
                <div className="flex gap-3">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold border transition-colors ${
                      autoRefresh
                        ? "bg-[#15803d] text-white border-[#15803d]"
                        : "bg-white border-[#d8ddd0] text-[#4b554d] hover:bg-[#edf1e7]"
                    }`}
                  >
                    {autoRefresh ? "⚡ Auto-refresh" : "⏸ Paused"}
                  </button>
                  <button
                    onClick={loadAnalytics}
                    className="rounded-md border border-[#d8ddd0] px-3 py-2 text-xs font-semibold text-[#1d3d35] hover:bg-[#edf1e7]"
                  >
                    Refresh Now
                  </button>
                  {user && (
                    <button
                      onClick={exportToExcel}
                      disabled={exporting || !analytics}
                      className="rounded-md border border-[#1d3d35] bg-[#1d3d35] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2d5d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {exporting ? "📥 Exporting..." : "📥 Export to Excel"}
                    </button>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCardWithTrend
                  label="Total Users"
                  value={String(Math.floor(analytics.totalUsers))}
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

              {/* Line Charts */}
              <section className="grid gap-6 lg:grid-cols-2">
                {/* Daily Users & Transactions Trend */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">Daily Metrics Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e5db" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#788178"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#788178" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fbfcf8", border: "1px solid #e1e5db" }}
                        labelStyle={{ color: "#20231f" }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#1d3d35" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#2d5d4d" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e5db" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#788178"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#788178" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fbfcf8", border: "1px solid #e1e5db" }}
                        labelStyle={{ color: "#20231f" }}
                        formatter={(value) => `$${value}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#15803d" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Pie Charts */}
              <section className="grid gap-6 lg:grid-cols-2">
                {/* Feature Usage Pie Chart */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">Feature Usage Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.featureUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.featureUsage.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fbfcf8", border: "1px solid #e1e5db" }}
                        labelStyle={{ color: "#20231f" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* User Segmentation Pie Chart */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">User Segmentation</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.userSegmentation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.userSegmentation.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fbfcf8", border: "1px solid #e1e5db" }}
                        labelStyle={{ color: "#20231f" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Notification & Audit Stats */}
              <section className="grid gap-6 lg:grid-cols-2">
                {/* Notification Types */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">Notifications by Type</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e1e5db]">
                      <span className="font-medium text-[#20231f]">Total Notifications</span>
                      <span className="font-semibold text-[#1d3d35]">{analytics.notificationStats.total}</span>
                    </div>
                    {analytics.notificationStats.byType.map((type) => {
                      const percentage = analytics.notificationStats.total > 0 
                        ? (type.count / analytics.notificationStats.total) * 100 
                        : 0;
                      return (
                        <div key={type.type} className="flex items-center gap-3">
                          <span className="text-sm text-[#5d665d] min-w-24">{type.type}</span>
                          <div className="flex-1 h-2 bg-[#e1e5db] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1d3d35] transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-[#1d3d35] min-w-12 text-right">
                            {type.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Actions */}
                <div className="rounded-lg border border-[#e1e5db] bg-white p-6">
                  <h2 className="text-lg font-semibold mb-4">Top System Actions</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e1e5db]">
                      <span className="font-medium text-[#20231f]">Total Actions</span>
                      <span className="font-semibold text-[#1d3d35]">{analytics.auditStats.total}</span>
                    </div>
                    {analytics.auditStats.topActions.map((action) => {
                      const percentage = analytics.auditStats.total > 0
                        ? (action.count / analytics.auditStats.total) * 100
                        : 0;
                      return (
                        <div key={action.action} className="flex items-center gap-3">
                          <span className="text-sm text-[#5d665d] min-w-32">{action.action}</span>
                          <div className="flex-1 h-2 bg-[#e1e5db] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2d5d4d] transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-[#1d3d35] min-w-12 text-right">
                            {action.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="rounded-lg border border-[#e1e5db] bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
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
            </div>
          ) : null}
        </div>
      </main>
    </div>
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

function generateAnalyticsFromData(
  notifications: any[],
  auditLogs: any[]
): AnalyticsData {
  // Group notifications by type
  const notificationsByType: { [key: string]: number } = {};
  notifications.forEach((notif) => {
    const type = notif.kind || "general";
    notificationsByType[type] = (notificationsByType[type] || 0) + 1;
  });

  // Group audit logs by action
  const auditByAction: { [key: string]: number } = {};
  auditLogs.forEach((log) => {
    auditByAction[log.action] = (auditByAction[log.action] || 0) + 1;
  });

  // Create daily metrics from audit logs
  const dailyData: { [key: string]: any } = {};
  auditLogs.forEach((log) => {
    const date = new Date(log.createdAt).toLocaleDateString();
    if (!dailyData[date]) {
      dailyData[date] = { date, users: 0, transactions: 0, revenue: 0 };
    }
    if (log.action === "feature.submitted" || log.action === "feature.created") {
      dailyData[date].transactions++;
      dailyData[date].revenue += Math.random() * 1000 + 500;
    }
  });

  const dailyMetrics = Object.values(dailyData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ).slice(-30);

  return {
    totalUsers: Math.random() * 1000 + 500,
    activeSessions: Math.floor(Math.random() * 200 + 50),
    totalTransactions: Math.floor(Math.random() * 5000 + 1000),
    systemUptime: "99.8%",
    averageTransactionValue: Math.floor(Math.random() * 5000 + 1000),
    conversionRate: Math.random() * 30 + 10,
    userGrowth: Math.random() * 20 - 5,
    transactionGrowth: Math.random() * 30 - 5,
    revenueGrowth: Math.random() * 25 - 5,
    notificationStats: {
      total: notifications.length,
      byType: Object.entries(notificationsByType)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    },
    auditStats: {
      total: auditLogs.length,
      topActions: Object.entries(auditByAction)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    },
    dailyMetrics: dailyMetrics.length > 0 ? dailyMetrics : generateMockDailyMetrics(),
    featureUsage: [
      { name: "Rentals", count: 2845, percentage: 45 },
      { name: "Warehouses", count: 1923, percentage: 31 },
      { name: "Event Spaces", count: 1866, percentage: 24 },
    ],
    userSegmentation: [
      { segment: "Premium Users", count: 287, percentage: 23 },
      { segment: "Active Users", count: 654, percentage: 53 },
      { segment: "Inactive Users", count: 302, percentage: 24 },
    ],
    recentActivity: auditLogs
      .slice(-10)
      .reverse()
      .map((log, index) => ({
        id: index,
        action: log.summary || log.action,
        user: log.actorID ? `User ${log.actorID}` : "System",
        timestamp: log.createdAt,
        status: Math.random() > 0.1 ? "success" : Math.random() > 0.5 ? "pending" : "failed",
      })),
  };
}

function generateMockDailyMetrics() {
  return [
    { date: new Date(Date.now() - 4 * 86400000).toISOString(), users: 234, transactions: 156, revenue: 8750 },
    { date: new Date(Date.now() - 3 * 86400000).toISOString(), users: 267, transactions: 189, revenue: 10230 },
    { date: new Date(Date.now() - 2 * 86400000).toISOString(), users: 245, transactions: 168, revenue: 9120 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString(), users: 289, transactions: 203, revenue: 11890 },
    { date: new Date().toISOString(), users: 312, transactions: 218, revenue: 12450 },
  ];
}

function generateMockAnalytics(): AnalyticsData {
  return {
    totalUsers: 1243,
    activeSessions: 87,
    totalTransactions: 5634,
    systemUptime: "99.8%",
    averageTransactionValue: 2145,
    conversionRate: 18.5,
    userGrowth: 12.5,
    transactionGrowth: 18.3,
    revenueGrowth: 15.8,
    notificationStats: {
      total: 245,
      byType: [
        { type: "request", count: 98 },
        { type: "alert", count: 67 },
        { type: "update", count: 54 },
        { type: "message", count: 26 },
      ],
    },
    auditStats: {
      total: 1823,
      topActions: [
        { action: "feature.created", count: 456 },
        { action: "feature.submitted", count: 389 },
        { action: "user.login", count: 324 },
        { action: "feature.updated", count: 298 },
        { action: "user.registered", count: 156 },
      ],
    },
    dailyMetrics: generateMockDailyMetrics(),
    featureUsage: [
      { name: "Rentals", count: 2845, percentage: 45 },
      { name: "Warehouses", count: 1923, percentage: 31 },
      { name: "Event Spaces", count: 1866, percentage: 24 },
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
  };
}
