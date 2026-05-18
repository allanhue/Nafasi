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
  const feature = features.find((item) => item.key === featureKey) ?? features[0];

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {feature.stats.map((stat) => (
          <div className="rounded-lg border border-[#e1e5db] bg-white p-4" key={stat.label}>
            <p className="text-sm font-medium text-[#677067]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20231f]">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-[#788178]">{stat.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
        <h2 className="text-lg font-semibold text-[#20231f]">Pipeline movement</h2>
        <div className="mt-4 space-y-4">
          {feature.pipeline.map((item, index) => (
            <div key={item.label}>
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
          ))}
        </div>
      </div>
    </div>
  );
}

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
