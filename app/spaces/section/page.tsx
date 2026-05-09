import { redirect } from "next/navigation";

type SpacesSectionPageProps = {
  searchParams: Promise<{ item?: string }>;
};

export default async function SpacesSectionPage({ searchParams }: SpacesSectionPageProps) {
  const { item } = await searchParams;

  redirect(`/spaces/${item ?? "events"}`);
}
