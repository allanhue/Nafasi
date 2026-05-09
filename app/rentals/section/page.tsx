import { redirect } from "next/navigation";

type RentalsSectionPageProps = {
  searchParams: Promise<{ item?: string }>;
};

export default async function RentalsSectionPage({ searchParams }: RentalsSectionPageProps) {
  const { item } = await searchParams;

  redirect(`/rentals/${item ?? "property-listings"}`);
}
