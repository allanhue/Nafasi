import SectionWorkspace from "@/app/components/section-workspace";

type SpacesSectionPageProps = {
  searchParams: Promise<{ item?: string }>;
};

export default async function SpacesSectionPage({ searchParams }: SpacesSectionPageProps) {
  const { item } = await searchParams;

  return <SectionWorkspace featureKey="spaces" sectionSlug={item ?? "events"} />;
}
