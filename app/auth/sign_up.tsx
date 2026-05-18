"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import LoadingOverlay from "@/app/components/loading_overlay";
import {
  authRequest,
  roleLabels,
  saveSession,
  signUpRoles,
  type AuthResponse,
} from "@/app/lib/auth";
import type { UserRole } from "@/app/lib/features";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const auth = await authRequest<AuthResponse>("/auth/signup", {
        name,
        email,
        password,
        role,
      });
      saveSession(auth);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="theme-bg grid min-h-screen place-items-center px-4 py-10">
      <LoadingOverlay isLoading={isSubmitting} label="Creating account..." />
      <section className="theme-surface w-full max-w-md rounded-lg border p-6 shadow-sm">
        <Link className="text-sm font-semibold theme-accent-text" href="/">
          Nafasi
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="theme-muted mt-2 text-sm leading-6">
          Choose whether you are booking space or providing listings.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[#394039]">Name</span>
            <input
              autoComplete="name"
              className="mt-2 w-full rounded-md border border-[#cfd6c9] bg-white px-3 py-2 text-sm"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>

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
            <span className="relative mt-2 block">
              <input
                autoComplete="new-password"
                className="w-full rounded-md border border-[#cfd6c9] bg-white py-2 pl-3 pr-12 text-sm"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#4b554d] hover:bg-[#edf1e7]"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                <PasswordEyeIcon isVisible={showPassword} />
              </button>
            </span>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-[#394039]">Account role</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {signUpRoles.map((item) => (
                <label
                  className={`rounded-md border px-3 py-2 text-sm ${
                    role === item
                      ? "border-[#1d3d35] bg-[#eef5df] text-[#1d3d35]"
                      : "border-[#cfd6c9] bg-white text-[#4b554d]"
                  }`}
                  key={item}
                >
                  <input
                    checked={role === item}
                    className="sr-only"
                    onChange={() => setRole(item)}
                    type="radio"
                    value={item}
                  />
                  {roleLabels[item]}
                </label>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-md border border-[#efc7c7] bg-[#fff5f5] px-3 py-2 text-sm text-[#9b1c1c]">
              {error}
            </p>
          ) : null}

          <button
            className="theme-accent flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="theme-muted mt-5 text-sm">
          Already registered?{" "}
          <Link className="font-semibold theme-accent-text" href="/auth/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

function PasswordEyeIcon({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" strokeLinecap="round" />
      <path d="M9.88 5.08A9.5 9.5 0 0 1 12 4.8c5 0 8.5 4.7 9.5 7.2a13.2 13.2 0 0 1-2.36 3.47" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.6 6.6A13.5 13.5 0 0 0 2.5 12c1 2.5 4.5 7.2 9.5 7.2 1.34 0 2.57-.34 3.66-.88" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2.5 12c1-2.5 4.5-7.2 9.5-7.2s8.5 4.7 9.5 7.2c-1 2.5-4.5 7.2-9.5 7.2S3.5 14.5 2.5 12z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
