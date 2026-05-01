import SectionWorkspace from "@/app/components/section-workspace";

type RentalsSectionPageProps = {
  searchParams: Promise<{ item?: string }>;
};

export default async function RentalsSectionPage({ searchParams }: RentalsSectionPageProps) {
  const { item } = await searchParams;

  return <SectionWorkspace featureKey="rentals" sectionSlug={item ?? "property-listings"} />;
}
