import Link from "next/link";

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
            <Link className="rounded-md bg-[#1d3d35] px-3 py-2 text-white" href="/auth/sign_up">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-16">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1d3d35]">
            Rental operations, made clear
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#20231f] sm:text-6xl">
            Rent records everyone can trust.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#5d665d]">
            Keep unit status, rent, arrears, and tenant requests together. Give landlords a clear
            view and caretakers a simple way to keep records up to date.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-[#1d3d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142d27]" href="/auth/sign_up">
              Create an account
            </Link>
            <Link className="rounded-lg border border-[#b9c3b2] bg-white px-5 py-3 text-sm font-semibold text-[#1d3d35] transition hover:border-[#1d3d35]" href="/auth/login">
              Sign in
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl gap-4 border-t border-[#d8ddd0] pt-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-[#20231f]">Unit-first</p>
              <p className="mt-1 text-xs leading-5 text-[#5d665d]">See tenants, balances, and requests in context.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#20231f]">Caretaker-ready</p>
              <p className="mt-1 text-xs leading-5 text-[#5d665d]">Keep everyday updates simple on mobile.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#20231f]">Clear records</p>
              <p className="mt-1 text-xs leading-5 text-[#5d665d]">Make rent status and follow-up easy to see.</p>
            </div>
          </div>
        </section>

        <section aria-label="Demo rental portfolio" className="rounded-2xl border border-[#d8ddd0] bg-[#fbfcf8] p-5 shadow-lg shadow-[#20231f]/5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#788178]">Today at a glance</p>
              <h2 className="mt-2 text-xl font-semibold text-[#20231f]">Riverdale Apartments</h2>
            </div>
            <span className="rounded-full bg-[#e9f1e8] px-3 py-1 text-xs font-semibold text-[#1d3d35]">Demo</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <article className="rounded-xl border border-[#e1e5db] bg-white p-4">
              <p className="text-sm text-[#5d665d]">Units occupied</p>
              <p className="mt-2 text-2xl font-semibold text-[#20231f]">8 <span className="text-sm font-medium text-[#788178]">/ 10</span></p>
            </article>
            <article className="rounded-xl border border-[#f0dfc5] bg-[#fffaf1] p-4">
              <p className="text-sm text-[#7c5a29]">Rent overdue</p>
              <p className="mt-2 text-2xl font-semibold text-[#20231f]">KES 45,000</p>
            </article>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#20231f]">Unit B3 · John Otieno</p>
                <p className="mt-1 text-xs text-[#5d665d]">Partial payment recorded</p>
              </div>
              <p className="text-sm font-semibold text-[#1d3d35]">KES 5,000 due</p>
            </div>
            <div className="mt-4 h-px bg-[#e7e9e2]" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#20231f]">Maintenance requests</p>
                <p className="mt-1 text-xs text-[#5d665d]">3 open · review and assign</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4ecf8] text-[#74448a]">3</span>
            </div>
          </div>
          <p className="mt-6 border-t border-[#e7e9e2] pt-4 text-xs leading-5 text-[#788178]">
            Example figures are for demonstration. Connect your workspace to view your own records.
          </p>
        </section>
      </section>
    </main>
  );
}
