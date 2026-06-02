"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LoadingCard } from "@/app/components/loading_overlay";
import { API_BASE_URL, getStoredToken } from "@/app/lib/auth";
import type { FeatureKey } from "@/app/lib/features";

type ReportMetric = {
  detail: string;
  label: string;
  value: string;
};

type ReportFollowUp = {
  detail: string;
  dueAt?: string;
  id: number;
  priority: string;
  status: string;
  title: string;
};

type FeatureReport = {
  accountLevels: ReportMetric[];
  bottlenecks: ReportMetric[];
  featureKey: FeatureKey;
  followUps: ReportFollowUp[];
  funnel: ReportMetric[];
  generatedAt: string;
  kpis: ReportMetric[];
  period: string;
  trends: ReportMetric[];
};

export default function FeatureReportsPanel({ featureKey }: { featureKey: FeatureKey }) {
  const [report, setReport] = useState<FeatureReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const id = window.setTimeout(() => {
      const token = getStoredToken();
      if (!token) {
        if (isMounted) {
          setError("Sign in to view reports.");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError("");

      fetch(`${API_BASE_URL}/api/reports/${featureKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(payload.error ?? "Could not load report");
          }
          return payload.report as FeatureReport;
        })
        .then((nextReport) => {
          if (isMounted) {
            setReport(nextReport);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Could not load report");
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(id);
    };
  }, [featureKey]);

  if (isLoading) {
    return (
      <div className="mt-6">
        <LoadingCard label="Loading report data..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mt-6 rounded-lg border border-[#efc7c7] bg-[#fff5f5] p-4 text-sm text-[#9b1c1c]">
        {error || "Report is unavailable."}
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[#e1e5db] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
            {report.period}
          </p>
          <p className="mt-1 text-sm text-[#5d665d]">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportLink featureKey={featureKey} format="csv" label="Export CSV" />
          <ExportLink featureKey={featureKey} format="xlsx" label="Export XLSX" />
        </div>
      </div>

      <MetricGrid metrics={report.kpis} />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ReportCard title="Conversion funnel">
          <ProgressMetrics metrics={report.funnel} />
        </ReportCard>

        <ReportCard title="Account-level reporting">
          <MetricList metrics={report.accountLevels} emptyLabel="No account ownership yet." />
        </ReportCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <ReportCard title="SLA follow-up work">
          {report.followUps.length === 0 ? (
            <p className="text-sm text-[#5d665d]">No open follow-up tasks.</p>
          ) : (
            <div className="grid gap-3">
              {report.followUps.map((item) => (
                <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#20231f]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#5d665d]">{item.detail}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#1d3d35] ring-1 ring-[#d8ddd0]">
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#788178]">
                    {item.status}
                    {item.dueAt ? ` · Due ${new Date(item.dueAt).toLocaleDateString()}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </ReportCard>

        <ReportCard title="Trends and bottlenecks">
          <MetricList metrics={report.trends} emptyLabel="No trend data yet." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {report.bottlenecks.map((item) => (
              <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-[#1d3d35]">{item.value}</p>
                <p className="mt-1 text-sm leading-6 text-[#4b554d]">{item.detail}</p>
              </article>
            ))}
          </div>
        </ReportCard>
      </div>
    </div>
  );
}

function ExportLink({
  featureKey,
  format,
  label,
}: {
  featureKey: FeatureKey;
  format: "csv" | "xlsx";
  label: string;
}) {
  async function handleExport() {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/reports/${featureKey}/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${featureKey}_report.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <button
      className="rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-xs font-semibold text-[#1d3d35] hover:bg-[#edf1e7]"
      onClick={handleExport}
      type="button"
    >
      {label}
    </button>
  );
}

function MetricGrid({ metrics }: { metrics: ReportMetric[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article className="rounded-lg border border-[#e1e5db] bg-white p-4" key={metric.label}>
          <p className="text-sm font-medium text-[#677067]">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20231f]">{metric.value}</p>
          <p className="mt-2 text-sm leading-6 text-[#788178]">{metric.detail}</p>
        </article>
      ))}
    </div>
  );
}

function ReportCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-[#e1e5db] bg-white p-4">
      <h2 className="text-lg font-semibold text-[#20231f]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProgressMetrics({ metrics }: { metrics: ReportMetric[] }) {
  const maxValue = Math.max(...metrics.map((metric) => Number(metric.value) || 0), 1);

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const value = Number(metric.value) || 0;
        return (
          <div key={metric.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-[#4b554d]">{metric.label}</span>
              <span className="font-semibold text-[#20231f]">{metric.value}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#e4e8dd]">
              <div
                className="h-2 rounded-full bg-[#1d3d35]"
                style={{ width: `${Math.max(8, (value / maxValue) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[#788178]">{metric.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

function MetricList({ emptyLabel, metrics }: { emptyLabel: string; metrics: ReportMetric[] }) {
  if (metrics.length === 0) {
    return <p className="text-sm text-[#5d665d]">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#e1e5db]">
      {metrics.map((metric) => (
        <div className="grid gap-3 border-b border-[#e1e5db] bg-white p-3 text-sm last:border-0 md:grid-cols-[1fr_7rem_1fr]" key={metric.label}>
          <span className="font-medium text-[#20231f]">{metric.label}</span>
          <span className="font-semibold text-[#1d3d35]">{metric.value}</span>
          <span className="text-[#4b554d]">{metric.detail}</span>
        </div>
      ))}
    </div>
  );
}
