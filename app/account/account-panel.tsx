import type { Feature, FeatureKey } from "@/app/lib/features";

type AccountPanelProps = {
  activeFeature: Feature;
  features: Feature[];
  onFeatureChange: (feature: FeatureKey) => void;
};

export default function AccountPanel({
  activeFeature,
  features,
  onFeatureChange,
}: AccountPanelProps) {
  return (
    <section className="rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
            Account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#20231f] sm:text-3xl">
            Choose the feature area you want to manage
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5d665d] sm:text-base">
            Nafasi can run rentals, warehouse storage, and event spaces from one account.
            Switching here changes the dashboard focus, metrics, and operational tasks.
          </p>
        </div>
        <div className="rounded-md border border-[#d8ddd0] bg-white px-4 py-3">
          <p className="text-xs font-medium text-[#788178]">Active mode</p>
          <p className="mt-1 text-lg font-semibold text-[#1d3d35]">{activeFeature.label}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {features.map((feature) => {
          const isActive = feature.key === activeFeature.key;

          return (
            <button
              className={`min-h-44 rounded-lg border p-4 text-left transition ${
                isActive
                  ? "border-[#1d3d35] bg-[#eef5df] shadow-sm"
                  : "border-[#d8ddd0] bg-white hover:border-[#9aa78f] hover:bg-[#f7f9f2]"
              }`}
              key={feature.key}
              onClick={() => onFeatureChange(feature.key)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-lg font-semibold text-[#20231f]">{feature.label}</span>
                <span
                  className={`h-4 w-4 rounded-full border ${
                    isActive ? "border-[#1d3d35] bg-[#1d3d35]" : "border-[#aeb7a9]"
                  }`}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5d665d]">{feature.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
                {feature.shortLabel} workspace
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
          <h2 className="text-base font-semibold text-[#20231f]">Marketplace Position</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
                Customer side
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4b554d]">{activeFeature.customerRole}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#788178]">
                Provider side
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4b554d]">{activeFeature.providerRole}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#e1e5db] bg-white p-4">
          <h2 className="text-base font-semibold text-[#20231f]">Feature Modules</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {activeFeature.modules.map((module) => (
              <div className="rounded-md bg-[#f5f6f1] p-3" key={module.title}>
                <p className="text-sm font-semibold text-[#20231f]">{module.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#5d665d]">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
