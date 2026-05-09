import { redirect } from "next/navigation";

type WarehouseSectionPageProps = {
  searchParams: Promise<{ item?: string }>;
};

export default async function WarehouseSectionPage({ searchParams }: WarehouseSectionPageProps) {
  const { item } = await searchParams;

  redirect(`/warehouse/${item ?? "storage-requests"}`);
}
