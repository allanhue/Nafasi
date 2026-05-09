import DashboardOverview from "@/app/dashboard/dashboard_overview";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import { defaultFeature, features, type FeatureKey } from "@/app/lib/features";

type NafasiShellProps = {
  initialFeature?: FeatureKey;
  view?: "workspace" | "account" | "dashboard";
};

export default function NafasiShell({
  initialFeature = defaultFeature.key,
}: NafasiShellProps) {
  const feature = features.find((item) => item.key === initialFeature) ?? defaultFeature;

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#20231f]">
      <Navbar activeFeature={feature} />
      <Sidebar activeFeature={feature} />
      <div className="nafasi-sidebar-offset px-4 py-5 transition-all duration-300 sm:px-6 lg:px-8">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <DashboardOverview activeFeature={feature} />
        </main>
      </div>
    </div>
  );
}
