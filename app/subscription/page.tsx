"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import LoadingOverlay, { ButtonSpinner } from "@/app/components/loading-overlay";
import { API_BASE_URL, roleLabels, signUpRoles } from "@/app/lib/auth";
import type { UserRole } from "@/app/lib/features";

const plans = [
  {
    name: "Starter",
    price: "KES 2,500",
    detail: "For customers and small providers validating one workspace.",
  },
  {
    name: "Operator",
    price: "KES 7,500",
    detail: "For providers managing listings, requests, bookings, and follow-up.",
  },
  {
    name: "Network",
    price: "KES 18,000",
    detail: "For teams running rentals, warehouses, and event spaces together.",
  },
];

export default function SubscriptionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [plan, setPlan] = useState(plans[0].name);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/mail/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, role, plan }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send subscription request");
      }
      setMessage("Subscription request sent. Create your account to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send subscription request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f6f1] px-4 py-10 text-[#20231f] sm:px-6 lg:px-8">
      <LoadingOverlay isLoading={isSubmitting} label="Sending..." />
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-[#1d3d35]" href="/home">
            Nafasi
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm font-semibold text-[#4b554d] hover:bg-[#edf1e7]" href="/auth/login">
            Login
          </Link>
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7a68]">
              Subscription
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Pick a plan, then create your Nafasi account.
            </h1>
            <p className="mt-4 text-base leading-7 text-[#5d665d]">
              Send your subscription interest to the Nafasi team. After that, sign up as a customer or provider. Existing users can go straight to login.
            </p>

            <div className="mt-6 grid gap-3">
              {plans.map((item) => (
                <button
                  className={`rounded-lg border p-4 text-left transition ${
                    plan === item.name
                      ? "border-[#1d3d35] bg-[#eef5df]"
                      : "border-[#d8ddd0] bg-[#fbfcf8] hover:border-[#9aa78f]"
                  }`}
                  key={item.name}
                  onClick={() => setPlan(item.name)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold">{item.name}</span>
                    <span className="text-sm font-semibold text-[#1d3d35]">{item.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5d665d]">{item.detail}</p>
                </button>
              ))}
            </div>
          </div>

          <form className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm" onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold">Subscription request</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[#394039]">Name</span>
                <input className="mt-2 w-full rounded-md border border-[#cfd6c9] bg-white px-3 py-2 text-sm" onChange={(event) => setName(event.target.value)} required value={name} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#394039]">Email</span>
                <input className="mt-2 w-full rounded-md border border-[#cfd6c9] bg-white px-3 py-2 text-sm" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
              </label>
              <fieldset>
                <legend className="text-sm font-medium text-[#394039]">I am joining as</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {signUpRoles.map((item) => (
                    <label className={`rounded-md border px-3 py-2 text-sm ${role === item ? "border-[#1d3d35] bg-[#eef5df] text-[#1d3d35]" : "border-[#cfd6c9] bg-white text-[#4b554d]"}`} key={item}>
                      <input checked={role === item} className="sr-only" onChange={() => setRole(item)} type="radio" />
                      {roleLabels[item]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {message ? <p className="mt-4 rounded-md border border-[#b8d6b8] bg-[#f2fbf2] px-3 py-2 text-sm text-[#225522]">{message}</p> : null}
            {error ? <p className="mt-4 rounded-md border border-[#efc7c7] bg-[#fff5f5] px-3 py-2 text-sm text-[#9b1c1c]">{error}</p> : null}

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send subscription request"}
            </button>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link className="rounded-md border border-[#b9c3b2] bg-white px-4 py-2 text-center text-sm font-semibold text-[#1d3d35]" href="/auth/sign_up">
                Continue to sign up
              </Link>
              <Link className="rounded-md px-4 py-2 text-center text-sm font-semibold text-[#4b554d] hover:bg-[#edf1e7]" href="/auth/login">
                Existing user login
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
