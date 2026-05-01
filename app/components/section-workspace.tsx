import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { features, getFeatureSections, type FeatureKey } from "@/app/lib/features";

type SectionWorkspaceProps = {
  featureKey: FeatureKey;
  sectionSlug: string;
};

export default function SectionWorkspace({ featureKey, sectionSlug }: SectionWorkspaceProps) {
  const feature = features.find((item) => item.key === featureKey) ?? features[0];
  const sections = getFeatureSections(feature);
  const section = sections.find((item) => item.slug === sectionSlug);

  if (!section || section.type === "overview") {
    notFound();
  }

  const relatedSections = sections.filter((item) => item.slug !== section.slug);

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Navbar activeFeature={feature} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Sidebar activeFeature={feature} />
        <main className="min-w-0 flex-1">
          <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
                  {feature.label}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20231f]">
                  {section.title}
                </h1>
                <p className="mt-3 text-base leading-7 text-[#5d665d]">{section.description}</p>
              </div>
              <Link
                className="rounded-md border border-[#b9c3b2] bg-white px-4 py-2 text-center text-sm font-semibold text-[#1d3d35]"
                href={feature.route}
              >
                Back to overview
              </Link>
            </div>

            {section.type === "reports" ? (
              <div className="mt-6 grid gap-3 md:grid-cols-3">
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
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                  <h2 className="text-lg font-semibold">Active work</h2>
                  <div className="mt-4 space-y-3">
                    {feature.tasks.map((task) => (
                      <label
                        className="flex min-h-14 items-center gap-3 rounded-md border border-[#e1e5db] bg-[#f8faf5] px-3 py-2 text-sm font-medium text-[#4b554d]"
                        key={task}
                      >
                        <input className="h-4 w-4 accent-[#1d3d35]" type="checkbox" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                  <h2 className="text-lg font-semibold">Pipeline</h2>
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
            )}
          </section>

          <section className="mt-5 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">More in {feature.label}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedSections.map((item) => (
                <Link
                  className="rounded-lg border border-[#e1e5db] bg-white p-4 hover:border-[#9aa78f]"
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
        </main>
      </div>
    </div>
  );
}
