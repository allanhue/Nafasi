import Link from "next/link";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  Target,
  Zap,
  Activity,
  ArrowRight,
  Building2,
  CalendarClock,
  CircleAlert,
  CircleDollarSign,
  Home,
  Wrench,
} from "lucide-react";
import StatCard from "@/app/components/stat_card";
import type { Feature } from "@/app/lib/features";

type DashboardOverviewProps = {
  activeFeature: Feature;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trending: TrendingUp,
  check: CheckCircle,
  clock: Clock,
  alert: AlertCircle,
  users: Users,
  file: FileText,
  target: Target,
  zap: Zap,
  activity: Activity,
};

const variantMap = ["purple", "blue", "orange", "red", "green", "pink", "cyan", "indigo", "emerald"] as const;

export default function DashboardOverview({ activeFeature }: DashboardOverviewProps) {
  if (activeFeature.key === "rentals") {
    return <RentalTodayDashboard />;
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#20231f]">
              {activeFeature.dashboardTitle}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5d665d]">{activeFeature.description}</p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {activeFeature.stats.map((stat, idx) => (
            <StatCard
              key={stat.label}
              title={stat.label}
              value={stat.value}
              detail={stat.detail}
              variant={variantMap[idx % variantMap.length]}
              icon={iconMap.trending}
            />
          ))}
        </div>

        <div className="rounded-lg border border-[#d8ddd0] bg-[#eef5df] p-4 shadow-sm sm:p-6 mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
            Quick Access
          </p>
          <Link
            href="/analytics"
            className="mt-4 inline-block rounded-md bg-[#1d3d35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2419] transition-colors"
          >
            View Analytics →
          </Link>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-[#20231f]">Pipeline</h3>
            <span className="rounded-md bg-[#edf1e7] px-3 py-1 text-xs font-semibold text-[#4b554d]">
              This week
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {activeFeature.pipeline.map((item, index) => (
              <div className="grid grid-cols-[1fr_auto] items-center gap-4" key={item.label}>
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[#4b554d]">{item.label}</span>
                    <span className="font-semibold text-[#20231f]">{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#e4e8dd]">
                    <div
                      className="h-2 rounded-full bg-[#1d3d35]"
                      style={{ width: `${88 - index * 16}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-[#20231f]">Priority Tasks</h3>
          <div className="mt-5 space-y-3">
            {activeFeature.tasks.map((task) => (
              <label
                className="flex min-h-14 items-center gap-3 rounded-md border border-[#e1e5db] bg-white px-3 py-2 text-sm font-medium text-[#4b554d] hover:bg-[#f8faf5] transition-colors cursor-pointer"
                key={task}
              >
                <input className="h-4 w-4 accent-[#1d3d35]" type="checkbox" />
                <span>{task}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
              Service Flow
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#20231f]">
              Customer to provider handoff
            </h3>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5d665d]">
            This is the operating layer Nafasi manages between people requesting a service and
            the providers fulfilling it.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
              Customer
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4b554d]">{activeFeature.customerRole}</p>
          </div>
          <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
              Provider
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4b554d]">{activeFeature.providerRole}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RentalTodayDashboard() {
  const stats = [
    { label: "Units", value: "10", detail: "Across 1 property", icon: Building2, tone: "bg-[#e9f1e8] text-[#1d3d35]" },
    { label: "Occupied", value: "8", detail: "2 units vacant", icon: Home, tone: "bg-[#eef2fb] text-[#354f83]" },
    { label: "Rent overdue", value: "KES 45,000", detail: "Needs follow-up", icon: CircleDollarSign, tone: "bg-[#fff2df] text-[#9a5b0a]" },
    { label: "Open maintenance", value: "3", detail: "Requests to review", icon: Wrench, tone: "bg-[#f4ecf8] text-[#74448a]" },
  ];

  const actions = [
    { label: "View properties", href: "/rentals/property-listings", icon: Building2 },
    { label: "Review applications", href: "/rentals/applications", icon: Users },
    { label: "Check leases", href: "/rentals/leases", icon: FileText },
    { label: "View requests", href: "/rentals/viewing-requests", icon: CalendarClock },
  ];

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#1d3d35]">RENTAL OPERATIONS</p>
            <span className="rounded-full border border-[#d8ddd0] bg-white px-2.5 py-1 text-xs font-medium text-[#5d665d]">
              Demo workspace
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20231f] sm:text-4xl">
            Today
          </h1>
          <p className="mt-2 text-sm text-[#5d665d]">
            A clear view of the homes, rent, and work that need your attention.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1d3d35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#142d27]"
          href="/rentals/property-listings"
        >
          Open properties <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className="rounded-xl border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-5" key={label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#5d665d]">{label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#20231f]">{value}</p>
              </div>
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-xs text-[#788178]">{detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-xl border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#20231f]">Needs your attention</h2>
              <p className="mt-1 text-sm text-[#5d665d]">A short list of the next useful steps.</p>
            </div>
            <span className="rounded-full bg-[#fff2df] px-2.5 py-1 text-xs font-semibold text-[#9a5b0a]">3 items</span>
          </div>
          <div className="mt-5 divide-y divide-[#e7e9e2]">
            <AttentionRow
              color="text-[#a45518]"
              icon={<CircleAlert aria-hidden="true" className="h-5 w-5" />}
              title="John Otieno · Unit B3"
              detail="KES 5,000 overdue"
              href="/rentals/reports"
              action="View arrears"
            />
            <AttentionRow
              color="text-[#74448a]"
              icon={<Wrench aria-hidden="true" className="h-5 w-5" />}
              title="Maintenance requests"
              detail="3 open requests need an update"
              href="/calendar"
              action="Review work"
            />
            <AttentionRow
              color="text-[#354f83]"
              icon={<CalendarClock aria-hidden="true" className="h-5 w-5" />}
              title="Viewing requests"
              detail="4 visits need confirmation"
              href="/rentals/viewing-requests"
              action="See requests"
            />
          </div>
        </section>

        <section className="rounded-xl border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#20231f]">Portfolio snapshot</h2>
              <p className="mt-1 text-sm text-[#5d665d]">Riverdale Apartments</p>
            </div>
            <Link className="text-sm font-semibold text-[#1d3d35] hover:underline" href="/rentals/property-listings">
              View units
            </Link>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#4b554d]">Occupancy</span>
              <span className="font-semibold text-[#20231f]">8 of 10 units</span>
            </div>
            <div
              aria-label="8 of 10 units occupied"
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e4e8dd]"
              role="img"
            >
              <div className="h-full w-4/5 rounded-full bg-[#1d3d35]" />
            </div>
            <div className="mt-3 flex justify-between text-xs text-[#788178]">
              <span>8 occupied</span>
              <span>2 vacant</span>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-[#f2f5ed] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#788178]">Sample activity</p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#20231f]">Payment recorded · Unit B3</p>
                <p className="mt-1 text-xs text-[#5d665d]">John Otieno · M-Pesa</p>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-[#1d3d35]">KES 20,000</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#20231f]">Quick access</h2>
            <p className="mt-1 text-sm text-[#5d665d]">Go straight to the work you need to do.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map(({ label, href, icon: Icon }) => (
            <Link
              className="group flex min-h-14 items-center justify-between gap-3 rounded-lg border border-[#e1e5db] bg-white px-4 py-3 text-sm font-semibold text-[#354039] transition hover:border-[#9aa78f] hover:bg-[#f8faf5]"
              href={href}
              key={label}
            >
              <span className="flex items-center gap-3">
                <Icon aria-hidden="true" className="h-5 w-5 text-[#1d3d35]" />
                {label}
              </span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#788178] transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function AttentionRow({
  color,
  icon,
  title,
  detail,
  href,
  action,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-3 py-4 first:pt-5 last:pb-0">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f3f4f0] ${color}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#20231f]">{title}</p>
        <p className="mt-1 text-xs text-[#5d665d]">{detail}</p>
      </div>
      <Link className="shrink-0 text-xs font-semibold text-[#1d3d35] hover:underline" href={href}>
        {action}
      </Link>
    </div>
  );
}
