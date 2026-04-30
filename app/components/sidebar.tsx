import type { Feature } from "@/app/lib/features";

type SidebarProps = {
  activeFeature: Feature;
};

export default function Sidebar({ activeFeature }: SidebarProps) {
  const menu = ["Overview", ...activeFeature.modules.map((module) => module.title), "Reports"];

  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 shrink-0 rounded-lg border border-[#d8ddd0] bg-[#fbfcf8] p-4 lg:block">
      <div className="border-b border-[#e3e6dc] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788178]">
          Workspace
        </p>
        <h2 className="mt-2 text-xl font-semibold">{activeFeature.shortLabel}</h2>
        <p className="mt-2 text-sm leading-6 text-[#677067]">{activeFeature.accountFocus}</p>
      </div>
      <div className="mt-4 space-y-1">
        {menu.map((item, index) => (
          <button
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium ${
              index === 0
                ? "bg-[#1d3d35] text-white"
                : "text-[#4b554d] hover:bg-[#edf1e7]"
            }`}
            key={item}
            type="button"
          >
            <span>{item}</span>
            {index === 0 ? <span className="h-2 w-2 rounded-full bg-[#d9ff72]" /> : null}
          </button>
        ))}
      </div>
    </aside>
  );
}
