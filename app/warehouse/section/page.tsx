import SectionWorkspace from "@/app/components/section-workspace";

type WarehouseSectionPageProps = {
  searchParams: Promise<{ item?: string }>;
};

export default async function WarehouseSectionPage({ searchParams }: WarehouseSectionPageProps) {
  const { item } = await searchParams;

  return <SectionWorkspace featureKey="warehouses" sectionSlug={item ?? "storage-requests"} />;
}
