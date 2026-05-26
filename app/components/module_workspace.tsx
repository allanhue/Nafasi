import Link from "next/link";
import { notFound } from "next/navigation";
import ApplicationSubmissionForm from "@/app/components/application_submission_form";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import WorkspaceQueue, { type WorkspaceQueueItem } from "@/app/components/workspace_queue";
import { features, getFeatureSections, type FeatureKey } from "@/app/lib/features";

type ModuleWorkspaceProps = {
  featureKey: FeatureKey;
  moduleSlug: string;
};

export default function ModuleWorkspace({ featureKey, moduleSlug }: ModuleWorkspaceProps) {
  const feature = features.find((item) => item.key === featureKey) ?? features[0];
  const sections = getFeatureSections(feature);
  const section = sections.find((item) => item.slug === moduleSlug);

  if (!section || section.type === "overview") {
    notFound();
  }

  const relatedSections = sections.filter((item) => item.slug !== section.slug);
  const isReport = section.type === "reports";

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Sidebar activeFeature={feature} />
      <Navbar activeFeature={feature} />
      <main className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5">
          <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
                  {feature.label}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20231f]">
                  {section.title}
                </h1>
                <p className="mt-3 text-base leading-7 text-[#5d665d]">
                  {section.description}
                </p>
              </div>
              <Link
                className="rounded-md border border-[#b9c3b2] bg-white px-4 py-2 text-center text-sm font-semibold text-[#1d3d35] transition hover:border-[#1d3d35]"
                href={feature.route}
              >
                Back to overview
              </Link>
            </div>

            {isReport ? (
              <ReportsPanel featureKey={featureKey} />
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <ModuleOperationsPanel featureKey={featureKey} moduleSlug={moduleSlug} />
                <ApplicationSubmissionForm feature={feature} section={section} />
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">More in {feature.label}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedSections.map((item) => (
                <Link
                  className="rounded-lg border border-[#e1e5db] bg-white p-4 transition hover:border-[#9aa78f]"
                  href={item.href}
                  key={item.slug}
                >
                  <span className="text-sm font-semibold text-[#20231f]">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-[#5d665d]">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ModuleOperationsPanel({
  featureKey,
  moduleSlug,
}: {
  featureKey: FeatureKey;
  moduleSlug: string;
}) {
  const rows = getModuleRows(featureKey, moduleSlug);

  return <WorkspaceQueue featureKey={featureKey} moduleSlug={moduleSlug} rows={rows} />;
}

function ReportsPanel({ featureKey }: { featureKey: FeatureKey }) {
  const report = reportBlueprints[featureKey];
  const maxFunnelValue = Math.max(...report.funnel.map((item) => item.value));

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {report.kpis.map((stat) => (
          <article className="rounded-lg border border-[#e1e5db] bg-white p-4" key={stat.label}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[#677067]">{stat.label}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${stat.tone}`}>
                {stat.change}
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20231f]">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-[#788178]">{stat.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-[#e1e5db] bg-white p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#20231f]">Conversion funnel</h2>
              <p className="mt-1 text-sm text-[#5d665d]">{report.funnelSummary}</p>
            </div>
            <span className="rounded-md bg-[#edf1e7] px-3 py-1 text-xs font-semibold text-[#4b554d]">
              {report.period}
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {report.funnel.map((item, index) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[#4b554d]">{item.label}</span>
                  <span className="font-semibold text-[#20231f]">{item.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#e4e8dd]">
                  <div
                    className="h-2 rounded-full bg-[#1d3d35]"
                    style={{ width: `${Math.max(14, (item.value / maxFunnelValue) * 100 - index * 2)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#788178]">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#e1e5db] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#20231f]">Account health</h2>
          <div className="mt-4 grid gap-3">
            {report.accountHealth.map((item) => (
              <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.account}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#20231f]">{item.account}</h3>
                    <p className="mt-1 text-sm text-[#5d665d]">{item.focus}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#1d3d35] ring-1 ring-[#d8ddd0]">
                    {item.score}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  {item.metrics.map((metric) => (
                    <span className="rounded-md bg-white px-2 py-2 text-[#4b554d] ring-1 ring-[#e1e5db]" key={metric}>
                      {metric}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-[#e1e5db] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#20231f]">Follow-up priorities</h2>
          <div className="mt-4 space-y-3">
            {report.followUps.map((item) => (
              <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.title}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#20231f]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#5d665d]">{item.detail}</p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${item.tone}`}>
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#e1e5db] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#20231f]">Operational trends</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-[#e1e5db]">
            {report.trends.map((item) => (
              <div className="grid gap-3 border-b border-[#e1e5db] bg-white p-3 text-sm last:border-0 md:grid-cols-[1fr_7rem_8rem]" key={item.metric}>
                <span className="font-medium text-[#20231f]">{item.metric}</span>
                <span className="text-[#4b554d]">{item.value}</span>
                <span className="font-semibold text-[#1d3d35]">{item.direction}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {report.bottlenecks.map((item) => (
              <article className="rounded-md border border-[#e1e5db] bg-[#f8faf5] p-3" key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#4b554d]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

type ReportBlueprint = {
  accountHealth: Array<{
    account: string;
    focus: string;
    metrics: string[];
    score: string;
  }>;
  bottlenecks: Array<{
    detail: string;
    label: string;
  }>;
  followUps: Array<{
    detail: string;
    status: string;
    title: string;
    tone: string;
  }>;
  funnel: Array<{
    label: string;
    note: string;
    value: number;
  }>;
  funnelSummary: string;
  kpis: Array<{
    change: string;
    detail: string;
    label: string;
    tone: string;
    value: string;
  }>;
  period: string;
  trends: Array<{
    direction: string;
    metric: string;
    value: string;
  }>;
};

const positiveTone = "bg-[#dffcf0] text-[#15803d]";
const warningTone = "bg-[#fff7ed] text-[#b45309]";
const dangerTone = "bg-[#fee2e2] text-[#dc2626]";

const reportBlueprints: Record<FeatureKey, ReportBlueprint> = {
  rentals: {
    period: "Last 30 days",
    funnelSummary: "From listing views to signed leases, with attention on viewing confirmations.",
    kpis: [
      { label: "Listed units", value: "48", detail: "38 available for matching", change: "+6", tone: positiveTone },
      { label: "Viewing conversion", value: "41%", detail: "Requests that became confirmed visits", change: "+4.2%", tone: positiveTone },
      { label: "Application wait", value: "2.8d", detail: "Average landlord decision time", change: "-0.6d", tone: positiveTone },
      { label: "Lease risk", value: "7", detail: "Drafts missing deposit or renewal terms", change: "Needs review", tone: warningTone },
    ],
    funnel: [
      { label: "Property inquiries", value: 126, note: "New tenant leads across active listings" },
      { label: "Viewing requests", value: 31, note: "Visits awaiting provider schedule action" },
      { label: "Applications", value: 18, note: "Tenant files under review" },
      { label: "Lease drafting", value: 7, note: "Terms and handover milestones pending" },
    ],
    accountHealth: [
      { account: "Customers", focus: "Search, viewing, application, and move-in progress.", score: "82%", metrics: ["24 follow-ups", "18 files", "5 move-ins"] },
      { account: "Providers", focus: "Listing freshness, viewing response, and lease closure.", score: "76%", metrics: ["38 available", "9 stale", "7 drafts"] },
      { account: "Admins", focus: "Screening exceptions, overdue approvals, and dispute visibility.", score: "91%", metrics: ["4 escalations", "12 verified", "3 disputes"] },
    ],
    followUps: [
      { title: "Confirm weekend viewing route", detail: "Eight customers are waiting for time slots on high-intent listings.", status: "Today", tone: warningTone },
      { title: "Complete lease term checks", detail: "Deposit, inspection, and renewal clauses are incomplete in active drafts.", status: "Open", tone: warningTone },
      { title: "Refresh stale listings", detail: "Nine provider listings have not been updated after recent inquiries.", status: "Provider", tone: positiveTone },
    ],
    trends: [
      { metric: "Average rent on active leads", value: "KES 74k", direction: "+8%" },
      { metric: "No-show rate", value: "11%", direction: "-3%" },
      { metric: "Move-in readiness", value: "5 units", direction: "+2" },
      { metric: "Screening exceptions", value: "4 files", direction: "Flat" },
    ],
    bottlenecks: [
      { label: "Main blocker", detail: "Viewing confirmations are the biggest drop-off before applications." },
      { label: "Data gap", detail: "Lease value, payment status, and move-in checklist data should be structured." },
    ],
  },
  warehouses: {
    period: "Last 30 days",
    funnelSummary: "From storage demand to signed contracts, with capacity and logistics constraints visible.",
    kpis: [
      { label: "Capacity booked", value: "64%", detail: "11,400 sqm occupied", change: "+5%", tone: positiveTone },
      { label: "Quote speed", value: "1.9d", detail: "Average time from request to rate", change: "-0.4d", tone: positiveTone },
      { label: "Long-term demand", value: "8", detail: "Requests above six months", change: "+3", tone: positiveTone },
      { label: "Inspection risk", value: "5", detail: "Bays needing security or access checks", change: "Action", tone: warningTone },
    ],
    funnel: [
      { label: "Storage requests", value: 39, note: "Customer demand by space, goods, and duration" },
      { label: "Site visits", value: 16, note: "Visits and operator walkthroughs" },
      { label: "Quotes sent", value: 9, note: "Rates pending customer acceptance" },
      { label: "Contracts", value: 4, note: "Terms ready or signed" },
    ],
    accountHealth: [
      { account: "Customers", focus: "Space needs, access schedule, goods category, and storage term.", score: "79%", metrics: ["16 requests", "8 long-term", "6 urgent"] },
      { account: "Providers", focus: "Capacity accuracy, loading access, and security readiness.", score: "73%", metrics: ["22 bays", "5 checks", "14 loading"] },
      { account: "Admins", focus: "Quote aging, contract coverage, and logistics escalations.", score: "88%", metrics: ["6 quotes", "4 contracts", "3 escalations"] },
    ],
    followUps: [
      { title: "Quote long-term storage", detail: "High-value customers need rates, billing cycles, and access rules.", status: "Revenue", tone: positiveTone },
      { title: "Verify available square meters", detail: "Capacity must be reconciled before new warehouse listings are promoted.", status: "Ops", tone: warningTone },
      { title: "Resolve logistics windows", detail: "Pickup and offload timing is blocking two accepted storage requests.", status: "Due", tone: dangerTone },
    ],
    trends: [
      { metric: "Average requested space", value: "292 sqm", direction: "+12%" },
      { metric: "Quote acceptance", value: "44%", direction: "+6%" },
      { metric: "Logistics add-ons", value: "31%", direction: "+9%" },
      { metric: "Contract expiry alerts", value: "6", direction: "+2" },
    ],
    bottlenecks: [
      { label: "Main blocker", detail: "Capacity verification and quote approval slow down contract conversion." },
      { label: "Data gap", detail: "Capacity ledger, rate cards, access calendars, and billing events should be first-class backend data." },
    ],
  },
  spaces: {
    period: "Last 30 days",
    funnelSummary: "From promoter demand to confirmed events, with ticket and venue readiness tracked.",
    kpis: [
      { label: "Upcoming shows", value: "28", detail: "12 confirmed this month", change: "+7", tone: positiveTone },
      { label: "Booking match rate", value: "62%", detail: "Requests matched to a venue hold", change: "+5%", tone: positiveTone },
      { label: "Ticket readiness", value: "74%", detail: "Active tiers with price and quantity", change: "+11%", tone: positiveTone },
      { label: "Setup risk", value: "8", detail: "Events missing sound, lighting, or security notes", change: "Fix", tone: warningTone },
    ],
    funnel: [
      { label: "Promoter requests", value: 54, note: "Event and venue demand from organizers" },
      { label: "Venue holds", value: 21, note: "Dates reserved while details are confirmed" },
      { label: "Setup planning", value: 13, note: "Capacity, equipment, and staffing in progress" },
      { label: "Confirmed events", value: 12, note: "Ready for promotion and ticketing" },
    ],
    accountHealth: [
      { account: "Customers", focus: "Event discovery, reservations, ticket status, and check-in.", score: "84%", metrics: ["12 shows", "74% tiers", "3 refunds"] },
      { account: "Providers", focus: "Venue availability, booking response, and setup readiness.", score: "78%", metrics: ["17 venues", "8 setup gaps", "9 weekend"] },
      { account: "Admins", focus: "Capacity rules, permit notes, disputes, and promoter content.", score: "86%", metrics: ["4 permits", "6 drafts", "2 disputes"] },
    ],
    followUps: [
      { title: "Close setup requirements", detail: "Sound, lighting, and security details are incomplete for eight upcoming events.", status: "Ops", tone: warningTone },
      { title: "Publish ticket tiers", detail: "Ready events need quantities, price windows, and sales close dates.", status: "Sales", tone: positiveTone },
      { title: "Review promoter stories", detail: "Six blog drafts can drive demand for confirmed venues.", status: "Content", tone: positiveTone },
    ],
    trends: [
      { metric: "Average expected guests", value: "168", direction: "+14%" },
      { metric: "Venue hold expiry", value: "4 soon", direction: "Watch" },
      { metric: "Ticket reservations", value: "1,240", direction: "+18%" },
      { metric: "Check-in readiness", value: "69%", direction: "+10%" },
    ],
    bottlenecks: [
      { label: "Main blocker", detail: "Venue holds need faster setup confirmation before promotion and ticket sales." },
      { label: "Data gap", detail: "Ticket inventory, check-ins, venue calendar conflicts, and permit fields should be structured." },
    ],
  },
};

function getModuleRows(featureKey: FeatureKey, moduleSlug: string) {
  const rows: Record<string, WorkspaceQueueItem[]> = {
    "rentals:property-listings": [
      { title: "Westlands apartment", detail: "2 bedroom unit, parking, ready for viewing.", status: "Listed" },
      { title: "Kilimani studio", detail: "Budget lead wants a weekday viewing window.", status: "Lead" },
    ],
    "rentals:viewing-requests": [
      { title: "Saturday viewings", detail: "Four customer visits need provider confirmation.", status: "Pending" },
      { title: "Reschedule request", detail: "Tenant asked to move the visit to Tuesday afternoon.", status: "Open" },
    ],
    "rentals:applications": [
      { title: "Tenant profile review", detail: "Documents received; landlord decision is pending.", status: "Review" },
      { title: "Move-in application", detail: "Applicant prefers the first week of next month.", status: "New" },
    ],
    "rentals:leases": [
      { title: "Deposit terms", detail: "Lease draft needs deposit and renewal clauses checked.", status: "Draft" },
      { title: "Move-in handover", detail: "Keys and inspection checklist need owner approval.", status: "Ready" },
    ],
    "warehouses:storage-requests": [
      { title: "Retail stock request", detail: "300 sqm for six months with weekly access.", status: "New" },
      { title: "Cold-room inquiry", detail: "Customer needs rate guidance and power backup details.", status: "Quote" },
    ],
    "warehouses:warehouse-listings": [
      { title: "Mombasa Road bay", detail: "Loading access, 620 sqm available immediately.", status: "Available" },
      { title: "Industrial Area unit", detail: "Security inspection due before publishing.", status: "Check" },
    ],
    "warehouses:logistics-support": [
      { title: "Pickup window", detail: "Vehicle request needs loading team confirmation.", status: "Plan" },
      { title: "Delivery coordination", detail: "Customer asked for morning offload access.", status: "Open" },
    ],
    "warehouses:contracts": [
      { title: "Long-term storage", detail: "Quote accepted; access rules need contract wording.", status: "Draft" },
      { title: "Monthly billing", detail: "Recurring invoice dates need finance approval.", status: "Review" },
    ],
    "spaces:events": [
      { title: "Live showcase", detail: "Venue capacity and performer setup need confirmation.", status: "Planning" },
      { title: "Weekend disco", detail: "Ticket tiers are ready for promoter review.", status: "Ready" },
    ],
    "spaces:bookings": [
      { title: "Venue hold", detail: "Customer wants a soft hold while budget is approved.", status: "Hold" },
      { title: "Setup request", detail: "Sound, lighting, and security notes need venue response.", status: "Open" },
    ],
    "spaces:tickets": [
      { title: "Early bird tier", detail: "Reservation count is rising before the price change.", status: "Active" },
      { title: "Door list", detail: "Check-in team needs final ticket export.", status: "Due" },
    ],
    "spaces:blogs": [
      { title: "Promoter story", detail: "Draft announcement needs images and publishing date.", status: "Draft" },
      { title: "Venue spotlight", detail: "Owner interview has been received for editing.", status: "Edit" },
    ],
  };

  return rows[`${featureKey}:${moduleSlug}`] ?? [
    { title: "New submission", detail: "A customer request is ready for review.", status: "New" },
    { title: "Provider follow-up", detail: "Provider response is needed before the next step.", status: "Open" },
  ];
}
