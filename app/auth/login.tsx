"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import LoadingOverlay, { ButtonSpinner } from "@/app/components/loading-overlay";
import { authRequest, saveSession, type AuthResponse } from "@/app/lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const auth = await authRequest<AuthResponse>("/auth/login", {
        email,
        password,
      });
      saveSession(auth);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f1] px-4 py-10 text-[#20231f]">
      <LoadingOverlay isLoading={isSubmitting} label="Logging in..." />
      <section className="w-full max-w-md rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-6 shadow-sm">
        <Link className="text-sm font-semibold text-[#1d3d35]" href="/">
          Nafasi
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-[#5d665d]">
          Access your rentals, warehouse, and event space workspace.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[#394039]">Email</span>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-md border border-[#cfd6c9] bg-white px-3 py-2 text-sm"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#394039]">Password</span>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-[#cfd6c9] bg-white px-3 py-2 text-sm"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-3 py-2 text-sm text-[#9b1c1c]">
              {error}
            </p>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#5d665d]">
          Need an account?{" "}
          <Link className="font-semibold text-[#1d3d35]" href="/auth/sign_up">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
