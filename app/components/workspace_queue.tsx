"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeatureKey } from "@/app/lib/features";

export type WorkspaceQueueItem = {
  accountName?: string;
  detail: string;
  featureKey?: FeatureKey;
  fields?: Record<string, string>;
  image?: string | null;
  images?: string[];
  moduleSlug?: string;
  status: string;
  submittedAt?: string;
  title: string;
};

type WorkspaceQueueProps = {
  featureKey: FeatureKey;
  moduleSlug: string;
  rows: WorkspaceQueueItem[];
};

const STORAGE_KEY = "nafasi_workspace_queue";
export const WORKSPACE_QUEUE_EVENT = "nafasi-workspace-queue-updated";

export default function WorkspaceQueue({ featureKey, moduleSlug, rows }: WorkspaceQueueProps) {
  const [uploadedRows, setUploadedRows] = useState<WorkspaceQueueItem[]>([]);
  const [activeRow, setActiveRow] = useState<WorkspaceQueueItem | null>(null);

  useEffect(() => {
    function syncRows() {
      setUploadedRows(readStoredQueue(featureKey, moduleSlug));
    }

    const id = window.setTimeout(syncRows, 0);
    window.addEventListener("storage", syncRows);
    window.addEventListener(WORKSPACE_QUEUE_EVENT, syncRows);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("storage", syncRows);
      window.removeEventListener(WORKSPACE_QUEUE_EVENT, syncRows);
    };
  }, [featureKey, moduleSlug]);

  const visibleRows = useMemo(
    () => [...uploadedRows, ...rows],
    [rows, uploadedRows]
  );

  return (
    <>
      <div className="rounded-lg border border-[#e1e5db] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#20231f]">Workspace queue</h2>
          <span className="rounded-md bg-[#edf1e7] px-3 py-1 text-xs font-semibold text-[#4b554d]">
            Live
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {visibleRows.map((row, index) => {
            const images = imagesForRow(row);
            const firstImage = images[0];

            return (
              <article
                className="group rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3 transition hover:border-[#9aa78f] hover:bg-white"
                key={`${row.title}-${row.submittedAt ?? index}`}
              >
                <div className="grid gap-3 sm:grid-cols-[4rem_1fr_auto] sm:items-start">
                  <button
                    aria-label={`Open ${row.title}`}
                    className="relative h-16 w-16 overflow-hidden rounded-md border border-[#d8ddd0] bg-[#edf1e7] text-sm font-semibold text-[#1d3d35]"
                    onClick={() => setActiveRow(row)}
                    type="button"
                  >
                    {firstImage ? (
                      <span
                        aria-hidden="true"
                        className="block h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${firstImage})` }}
                      />
                    ) : (
                      row.title.charAt(0)
                    )}
                    {images.length > 1 ? (
                      <span className="absolute bottom-1 right-1 rounded bg-[#20231f]/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {images.length}
                      </span>
                    ) : null}
                  </button>
                  <button
                    className="min-w-0 text-left"
                    onClick={() => setActiveRow(row)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#20231f]">{row.title}</h3>
                      {row.accountName ? (
                        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-[#677067] ring-1 ring-[#d8ddd0]">
                          {row.accountName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5d665d]">{row.detail}</p>
                  </button>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="shrink-0 rounded-md border border-[#d8ddd0] bg-white px-2 py-1 text-xs font-semibold text-[#4b554d]">
                      {row.status}
                    </span>
                    <button
                      aria-label={`Expand ${row.title}`}
                      className="grid h-8 w-8 place-items-center rounded-md border border-[#d8ddd0] bg-white text-[#4b554d] opacity-100 transition hover:border-[#1d3d35] hover:text-[#1d3d35] sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => setActiveRow(row)}
                      type="button"
                    >
                      <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {activeRow ? (
        <ExpandedQueueItem
          key={`${activeRow.title}-${activeRow.submittedAt ?? ""}`}
          row={activeRow}
          onClose={() => setActiveRow(null)}
        />
      ) : null}
    </>
  );
}

function ExpandedQueueItem({ onClose, row }: { onClose: () => void; row: WorkspaceQueueItem }) {
  const images = imagesForRow(row);
  const [activeImage, setActiveImage] = useState(images[0] ?? null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20231f]/55 p-4">
      <button
        aria-label="Close expanded queue item"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <article className="relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-[#d8ddd0] bg-white shadow-xl md:grid-cols-[20rem_1fr]">
        <div className="min-h-56 bg-[#edf1e7]">
          {activeImage ? (
            <div className="flex h-full min-h-56 flex-col gap-2 p-2">
              <span
                aria-hidden="true"
                className="block min-h-56 flex-1 rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url(${activeImage})` }}
              />
              {images.length > 1 ? (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      aria-label={`Show photo ${index + 1}`}
                      className={`h-14 overflow-hidden rounded-md border bg-white ${
                        activeImage === image ? "border-[#1d3d35]" : "border-[#d8ddd0]"
                      }`}
                      key={`${image.slice(0, 24)}-${index}`}
                      onClick={() => setActiveImage(image)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="block h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid h-full min-h-56 place-items-center text-5xl font-semibold text-[#1d3d35]">
              {row.title.charAt(0)}
            </div>
          )}
        </div>
        <div className="overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#788178]">
                {row.accountName ?? "Workspace item"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#20231f]">
                {row.title}
              </h3>
            </div>
            <button
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#d8ddd0] bg-white text-[#4b554d]"
              onClick={onClose}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18" strokeLinecap="round" />
                <path d="m6 6 12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <span className="mt-4 inline-flex rounded-md border border-[#d8ddd0] bg-[#f8faf5] px-3 py-1 text-xs font-semibold text-[#4b554d]">
            {row.status}
          </span>
          <p className="mt-4 text-sm leading-7 text-[#5d665d]">{row.detail}</p>
          {row.fields && Object.keys(row.fields).length > 0 ? (
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries(row.fields).map(([label, value]) => (
                value ? (
                  <div className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#788178]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#20231f]">{value}</dd>
                  </div>
                ) : null
              ))}
            </dl>
          ) : null}
        </div>
      </article>
    </div>
  );
}

export function saveWorkspaceQueueItem(item: WorkspaceQueueItem) {
  if (typeof window === "undefined") {
    return;
  }

  const storedRows = readAllStoredQueue();
  const nextRows = [{ ...item, submittedAt: item.submittedAt ?? new Date().toISOString() }, ...storedRows].slice(0, 40);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRows));
  window.dispatchEvent(new Event(WORKSPACE_QUEUE_EVENT));
}

function readStoredQueue(featureKey: FeatureKey, moduleSlug: string) {
  return readAllStoredQueue().filter(
    (item) => item.featureKey === featureKey && item.moduleSlug === moduleSlug
  );
}

function readAllStoredQueue() {
  if (typeof window === "undefined") {
    return [] as WorkspaceQueueItem[];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WorkspaceQueueItem[]) : [];
  } catch {
    return [];
  }
}

function imagesForRow(row: WorkspaceQueueItem) {
  if (row.images && row.images.length > 0) {
    return row.images;
  }

  return row.image ? [row.image] : [];
}
