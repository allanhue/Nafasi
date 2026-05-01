import Link from "next/link";
import { features } from "@/app/lib/features";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <header className="border-b border-[#d8ddd0] bg-[#fbfcf8]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1d3d35] text-sm font-bold text-white">
              N
            </span>
            <span className="text-base font-semibold">Nafasi</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link className="rounded-md px-3 py-2 text-[#4b554d] hover:bg-[#edf1e7]" href="/auth/login">
              Login
            </Link>
            <Link className="rounded-md bg-[#1d3d35] px-3 py-2 text-white" href="/subscription">
              Subscription
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7a68]">
            Rentals, storage, and events
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[#20231f] sm:text-5xl">
            Run every Nafasi workspace from one account.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d665d]">
            Start with a subscription request, create a new account when you are ready, or log in if your account already exists.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="rounded-md bg-[#1d3d35] px-5 py-3 text-sm font-semibold text-white" href="/subscription">
              Choose subscription
            </Link>
            <Link className="rounded-md border border-[#b9c3b2] bg-white px-5 py-3 text-sm font-semibold text-[#1d3d35]" href="/auth/sign_up">
              Sign up
            </Link>
            <Link className="rounded-md px-5 py-3 text-sm font-semibold text-[#4b554d] hover:bg-[#edf1e7]" href="/auth/login">
              Existing user login
            </Link>
          </div>
        </div>

        <div className="grid gap-3">
          {features.map((feature) => (
            <article className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-5 shadow-sm" key={feature.key}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{feature.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5d665d]">{feature.description}</p>
                </div>
                <Link className="shrink-0 rounded-md border border-[#d8ddd0] bg-white px-3 py-2 text-sm font-semibold text-[#1d3d35]" href={feature.route}>
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
