import DashboardOverview from "@/app/dashboard/dashboard-overview";
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
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Sidebar activeFeature={feature} />
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <DashboardOverview activeFeature={feature} />
        </main>
      </div>
    </div>
  );
}
