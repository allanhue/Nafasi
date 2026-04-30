import type { Feature } from "@/app/lib/features";

type DashboardOverviewProps = {
  activeFeature: Feature;
};

export default function DashboardOverview({ activeFeature }: DashboardOverviewProps) {
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
          {activeFeature.stats.map((stat) => (
            <div className="rounded-lg border border-[#e1e5db] bg-white p-4" key={stat.label}>
              <p className="text-sm font-medium text-[#677067]">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20231f]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-[#788178]">{stat.detail}</p>
            </div>
          ))}
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
                className="flex min-h-14 items-center gap-3 rounded-md border border-[#e1e5db] bg-white px-3 py-2 text-sm font-medium text-[#4b554d]"
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
