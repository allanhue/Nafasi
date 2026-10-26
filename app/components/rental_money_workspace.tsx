"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Printer, ReceiptText } from "lucide-react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { API_BASE_URL, getStoredToken } from "@/app/lib/auth";
import { features } from "@/app/lib/features";

type UnitOption = { id: number; title: string; location: string };
type TenantOption = { id: number; name: string; email: string; phone: string };
type Lease = {
  id: number;
  unitId: number;
  unit: string;
  property: string;
  tenantId: number;
  tenant: string;
  monthlyRent: string;
  dueDay: number;
  startDate: string;
  balance: string;
  status: string;
};
type Receipt = {
  receiptNumber: string;
  tenantName: string;
  unitName: string;
  landlordName: string;
  amount: string;
  method: string;
  paymentDate: string;
  rentPeriods: string[];
  balanceAfter: string;
  recordedBy: string;
  reference: string;
  notes: string;
};
type PaymentHistory = Receipt & { id: number };
type ArrearsItem = {
  invoiceId: number;
  leaseId: number;
  unit: string;
  tenant: string;
  period: string;
  dueDate: string;
  daysOverdue: number;
  balance: string;
  bucket: string;
};
type FinanceWorkspace = {
  units: UnitOption[];
  tenants: TenantOption[];
  leases: Lease[];
  receipts: PaymentHistory[];
  arrears: ArrearsItem[];
  arrearsBuckets: Record<string, string>;
};

const emptyWorkspace: FinanceWorkspace = {
  units: [],
  tenants: [],
  leases: [],
  receipts: [],
  arrears: [],
  arrearsBuckets: {},
};
const arrearsBucketNames = ["1–30 days", "31–60 days", "61–90 days", "90+ days"];
const rentalFeature = features.find((feature) => feature.key === "rentals")!;

export default function RentalMoneyWorkspace() {
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [selectedLease, setSelectedLease] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const idempotencyKey = useRef("");

  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [dueDay, setDueDay] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [paymentDate, setPaymentDate] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const loadWorkspace = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setError("Sign in with a landlord or caretaker account to access rent records.");
      setIsLoading(false);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/rentals/finance`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error ?? "Could not load rent records.");
    }
    setWorkspace({
      units: payload.units ?? [],
      tenants: payload.tenants ?? [],
      leases: payload.leases ?? [],
      receipts: payload.receipts ?? [],
      arrears: payload.arrears ?? [],
      arrearsBuckets: payload.arrearsBuckets ?? {},
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPaymentDate(localDateInput());
      loadWorkspace()
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : "Could not load rent records.");
        })
        .finally(() => setIsLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  async function postFinance<T>(path: string, body: unknown): Promise<T> {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Your session has expired. Sign in again to continue.");
    }
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error ?? "Could not save rent information.");
    }
    return payload as T;
  }

  async function createTenancy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const result = await postFinance<{ message: string }>("/api/rentals/finance/leases", {
        unitId: Number(unitId),
        tenantId: Number(tenantId) || 0,
        tenantName,
        tenantEmail,
        tenantPhone,
        monthlyRent,
        dueDay: Number(dueDay),
        startDate,
      });
      setNotice(result.message);
      setUnitId("");
      setTenantId("");
      setTenantName("");
      setTenantEmail("");
      setTenantPhone("");
      setMonthlyRent("");
      setStartDate("");
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create tenancy.");
    } finally {
      setIsSaving(false);
    }
  }

  async function generateInvoices(leaseId: number) {
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const result = await postFinance<{ created: number }>("/api/rentals/finance/invoices/generate", { leaseId });
      setNotice(result.created === 0 ? "All rent invoices due so far are already generated." : `${result.created} rent invoice(s) generated.`);
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not generate invoices.");
    } finally {
      setIsSaving(false);
    }
  }

  async function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }
    try {
      const result = await postFinance<{ receipt: Receipt }>("/api/rentals/finance/payments", {
        leaseId: Number(selectedLease),
        amount,
        method,
        paymentDate,
        reference,
        notes,
        idempotencyKey: idempotencyKey.current,
      });
      setReceipt(result.receipt);
      idempotencyKey.current = "";
      setAmount("");
      setReference("");
      setNotes("");
      setNotice("Payment saved and allocated to the oldest unpaid rent first. Receipt generated.");
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not record payment.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={rentalFeature} />
      <Navbar activeFeature={rentalFeature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5">
          <header className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-5 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">Rentals · Money</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Rent payments & arrears</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5d665d]">
              Set up a tenant and rent schedule, generate rent due through today, then record M-Pesa, cash, or bank payments.
              Payments are applied to the oldest unpaid invoice first.
            </p>
            {error ? <StatusMessage tone="error" text={error} /> : null}
            {notice ? <StatusMessage tone="success" text={notice} /> : null}
          </header>

          <section className="grid gap-4 lg:grid-cols-2">
            <form className="grid content-start gap-3 rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm" onSubmit={createTenancy}>
              <div>
                <h2 className="text-lg font-semibold">Add active tenancy</h2>
                <p className="mt-1 text-sm text-[#677067]">Connect a listed rental unit to its tenant and rent terms.</p>
              </div>
              <Field label="Unit">
                <select className="money-input" onChange={(event) => setUnitId(event.target.value)} required value={unitId}>
                  <option value="">Select an available unit</option>
                  {workspace.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}{unit.location ? ` · ${unit.location}` : ""}</option>)}
                </select>
              </Field>
              <Field label="Existing tenant (optional)">
                <select className="money-input" onChange={(event) => setTenantId(event.target.value)} required value={tenantId}>
                  <option value="">Add a new tenant</option>
                  {workspace.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}{tenant.email ? ` · ${tenant.email}` : ""}</option>)}
                </select>
              </Field>
              {!tenantId ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Tenant name">
                    <input className="money-input" maxLength={160} onChange={(event) => setTenantName(event.target.value)} required value={tenantName} />
                  </Field>
                  <Field label="Email (optional)">
                    <input className="money-input" maxLength={254} onChange={(event) => setTenantEmail(event.target.value)} type="email" value={tenantEmail} />
                  </Field>
                  <Field label="Phone (optional)">
                    <input className="money-input" maxLength={40} onChange={(event) => setTenantPhone(event.target.value)} type="tel" value={tenantPhone} />
                  </Field>
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Monthly rent (KES)">
                  <input className="money-input" min="0.01" onChange={(event) => setMonthlyRent(event.target.value)} required step="0.01" type="number" value={monthlyRent} />
                </Field>
                <Field label="Due day">
                  <input className="money-input" max="31" min="1" onChange={(event) => setDueDay(event.target.value)} required type="number" value={dueDay} />
                </Field>
                <Field label="Lease start">
                  <input className="money-input" onChange={(event) => setStartDate(event.target.value)} required type="date" value={startDate} />
                </Field>
              </div>
              <button className="money-primary" disabled={isSaving || workspace.units.length === 0} type="submit">
                {isSaving ? "Saving..." : "Create tenancy"}
              </button>
              {workspace.units.length === 0 ? <p className="text-xs text-[#788178]">Add a rental listing first to use it as a unit.</p> : null}
            </form>

            <form className="grid content-start gap-3 rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm" onSubmit={recordPayment}>
              <div>
                <h2 className="text-lg font-semibold">Record a rent payment</h2>
                <p className="mt-1 text-sm text-[#677067]">A receipt is generated as soon as the payment is saved.</p>
              </div>
              <Field label="Tenant and unit">
                <select className="money-input" onChange={(event) => setSelectedLease(event.target.value)} required value={selectedLease}>
                  <option value="">Select an active tenancy</option>
                  {workspace.leases.map((lease) => <option key={lease.id} value={lease.id}>{lease.unit} · {lease.tenant} · Balance {formatKES(lease.balance)}</option>)}
                </select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Amount (KES)">
                  <input className="money-input" min="0.01" onChange={(event) => setAmount(event.target.value)} required step="0.01" type="number" value={amount} />
                </Field>
                <Field label="Method">
                  <select className="money-input" onChange={(event) => setMethod(event.target.value)} value={method}>
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Payment date">
                  <input className="money-input" onChange={(event) => setPaymentDate(event.target.value)} required type="date" value={paymentDate} />
                </Field>
                <Field label="Reference (optional)">
                  <input className="money-input" maxLength={120} onChange={(event) => setReference(event.target.value)} placeholder="M-Pesa code or bank reference" value={reference} />
                </Field>
              </div>
              <Field label="Notes (optional)">
                <input className="money-input" maxLength={1000} onChange={(event) => setNotes(event.target.value)} value={notes} />
              </Field>
              <button className="money-primary" disabled={isSaving || workspace.leases.length === 0} type="submit">
                {isSaving ? "Saving..." : "Record payment"}
              </button>
              {workspace.leases.length === 0 ? <p className="text-xs text-[#788178]">Create an active tenancy and generate its due invoices first.</p> : null}
            </form>
          </section>

          <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Unit balances</h2>
                <p className="mt-1 text-sm text-[#677067]">Generate invoices only through today; repeated runs do not create duplicates.</p>
              </div>
            </div>
            {isLoading ? <p className="py-6 text-sm text-[#677067]">Loading rent records...</p> : workspace.leases.length === 0 ? (
              <p className="py-6 text-sm text-[#677067]">No active tenancies yet. Add a tenancy above to start the rent ledger.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-[#e1e5db] text-xs uppercase tracking-wide text-[#788178]">
                    <tr><th className="pb-3 pr-4">Unit / tenant</th><th className="pb-3 pr-4">Rent</th><th className="pb-3 pr-4">Due day</th><th className="pb-3 pr-4">Balance</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Action</th></tr>
                  </thead>
                  <tbody>
                    {workspace.leases.map((lease) => (
                      <tr className="border-b border-[#edf0e9] last:border-0" key={lease.id}>
                        <td className="py-3 pr-4"><span className="block font-semibold">{lease.unit}</span><span className="text-xs text-[#677067]">{lease.tenant}</span></td>
                        <td className="py-3 pr-4">{formatKES(lease.monthlyRent)}</td>
                        <td className="py-3 pr-4">Day {lease.dueDay}</td>
                        <td className="py-3 pr-4 font-semibold">{formatKES(lease.balance)}</td>
                        <td className="py-3 pr-4"><span className="rounded-full bg-[#edf1e7] px-2.5 py-1 text-xs font-semibold">{lease.status}</span></td>
                        <td className="py-3"><button className="text-left text-xs font-semibold text-[#1d3d35] underline underline-offset-2 disabled:opacity-50" disabled={isSaving} onClick={() => void generateInvoices(lease.id)} type="button">Generate due rent</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Arrears aging</h2>
            <p className="mt-1 text-sm text-[#677067]">Outstanding invoices are grouped by days past the rent due date.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {arrearsBucketNames.map((bucket) => (
                <div className="rounded-md border border-[#e1e5db] bg-[#fbfcf8] p-4" key={bucket}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#788178]">{bucket} overdue</p>
                  <p className="mt-2 text-xl font-semibold">{formatKES(workspace.arrearsBuckets[bucket] ?? "0")}</p>
                </div>
              ))}
            </div>
            {workspace.arrears.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-[#e1e5db] text-xs uppercase tracking-wide text-[#788178]"><tr><th className="pb-3 pr-4">Tenant / unit</th><th className="pb-3 pr-4">Rent period</th><th className="pb-3 pr-4">Due date</th><th className="pb-3 pr-4">Days overdue</th><th className="pb-3">Outstanding</th></tr></thead>
                  <tbody>
                    {workspace.arrears.map((item) => <tr className="border-b border-[#edf0e9] last:border-0" key={item.invoiceId}><td className="py-3 pr-4"><span className="block font-semibold">{item.tenant}</span><span className="text-xs text-[#677067]">{item.unit}</span></td><td className="py-3 pr-4">{formatPeriod(item.period)}</td><td className="py-3 pr-4">{item.dueDate}</td><td className="py-3 pr-4">{item.daysOverdue} days</td><td className="py-3 font-semibold">{formatKES(item.balance)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : <p className="mt-4 text-sm text-[#677067]">No overdue rent invoices.</p>}
          </section>

          <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Recent receipts</h2>
            {workspace.receipts.length === 0 ? <p className="mt-3 text-sm text-[#677067]">Recorded rent payments and receipts will appear here.</p> : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {workspace.receipts.map((item) => (
                  <article className="flex items-center justify-between gap-3 rounded-md border border-[#e1e5db] p-4" key={item.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.receiptNumber} · {item.tenantName}</p>
                      <p className="mt-1 text-xs text-[#677067]">{item.unitName} · {item.paymentDate} · {formatKES(item.amount)}</p>
                    </div>
                    <button aria-label={`Print ${item.receiptNumber}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#d8ddd0] text-[#1d3d35]" onClick={() => setReceipt(item)} type="button">
                      <Printer aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {receipt ? <ReceiptView onClose={() => setReceipt(null)} receipt={receipt} /> : null}
      <style jsx global>{`
        .money-input { min-height: 42px; width: 100%; border: 1px solid #d8ddd0; border-radius: 6px; background: #fff; padding: 8px 10px; font-size: 14px; color: #20231f; }
        .money-primary { min-height: 42px; border-radius: 6px; background: #1d3d35; padding: 9px 14px; color: white; font-size: 14px; font-weight: 600; }
        .money-primary:disabled { cursor: not-allowed; opacity: .55; }
        @media print {
          body * { visibility: hidden !important; }
          #receipt-print-area, #receipt-print-area * { visibility: visible !important; }
          #receipt-print-area { position: absolute; inset: 0; width: 100%; border: 0; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}

function ReceiptView({ onClose, receipt }: { onClose: () => void; receipt: Receipt }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#20231f]/40 p-4">
      <section className="w-full max-w-xl rounded-lg border border-[#d8ddd0] bg-white p-6 shadow-xl" id="receipt-print-area">
        <header className="flex items-start justify-between gap-3 border-b border-[#e1e5db] pb-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#788178]"><ReceiptText aria-hidden="true" className="h-4 w-4" /> Nafasi rent receipt</p>
            <h2 className="mt-2 text-2xl font-semibold">{receipt.receiptNumber}</h2>
          </div>
          <button className="rounded-md border border-[#d8ddd0] px-3 py-2 text-sm print:hidden" onClick={onClose} type="button">Close</button>
        </header>
        <dl className="grid gap-x-5 gap-y-4 py-5 sm:grid-cols-2">
          <ReceiptField label="Tenant" value={receipt.tenantName} />
          <ReceiptField label="Unit" value={receipt.unitName} />
          <ReceiptField label="Landlord / property" value={receipt.landlordName} />
          <ReceiptField label="Amount received" value={formatKES(receipt.amount)} />
          <ReceiptField label="Payment method" value={methodLabel(receipt.method)} />
          <ReceiptField label="Payment date" value={receipt.paymentDate} />
          <ReceiptField label="Rent period" value={receipt.rentPeriods.join(", ") || "Rent balance"} />
          <ReceiptField label="Balance after payment" value={formatKES(receipt.balanceAfter)} />
          <ReceiptField label="Recorded by" value={receipt.recordedBy} />
          <ReceiptField label="Reference" value={receipt.reference || "—"} />
          {receipt.notes ? <ReceiptField label="Notes" value={receipt.notes} /> : null}
        </dl>
        <button className="money-primary w-full print:hidden" onClick={() => window.print()} type="button">Print or save as PDF</button>
      </section>
    </div>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-[#788178]">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>;
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium text-[#354039]"><span>{label}</span>{children}</label>;
}

function StatusMessage({ text, tone }: { text: string; tone: "error" | "success" }) {
  return <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${tone === "error" ? "border-[#efc7c7] bg-[#fff5f5] text-[#9b1c1c]" : "border-[#b8d6b8] bg-[#f2fbf2] text-[#225522]"}`}>{text}</p>;
}

function formatKES(value: string) {
  const numericValue = Number(value);
  return `KES ${Number.isFinite(numericValue) ? numericValue.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}`;
}

function localDateInput() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function formatPeriod(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

function methodLabel(method: string) {
  return method === "mpesa" ? "M-Pesa" : method === "cash" ? "Cash" : "Bank";
}
