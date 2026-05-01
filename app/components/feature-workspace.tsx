import Link from "next/link";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { features, getFeatureSections, type FeatureKey } from "@/app/lib/features";

type FeatureWorkspaceProps = {
  featureKey: FeatureKey;
};

export default function FeatureWorkspace({ featureKey }: FeatureWorkspaceProps) {
  const feature = features.find((item) => item.key === featureKey) ?? features[0];
  const sections = getFeatureSections(feature);

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
                  {feature.dashboardTitle}
                </h1>
                <p className="mt-3 text-base leading-7 text-[#5d665d]">{feature.description}</p>
              </div>
              <Link
                className="rounded-md bg-[#1d3d35] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#244c42]"
                href="/account"
              >
                Switch account feature
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
                  Customer side
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4b554d]">{feature.customerRole}</p>
              </div>
              <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
                  Provider side
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4b554d]">{feature.providerRole}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {sections
                .filter((section) => section.type === "module")
                .map((section) => (
                  <Link
                    className="rounded-lg border border-[#e1e5db] bg-white p-4 hover:border-[#9aa78f]"
                    href={section.href}
                    key={section.slug}
                  >
                    <h2 className="text-lg font-semibold text-[#20231f]">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5d665d]">
                      {section.description}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
