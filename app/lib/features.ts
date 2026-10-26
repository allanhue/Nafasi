export type UserRole = "system_admin" | "admin" | "provider" | "customer";

export type FeatureKey = "rentals" | "warehouses";

export type Feature = {
  key: FeatureKey;
  label: string;
  shortLabel: string;
  route: string;
  description: string;
  accountFocus: string;
  dashboardTitle: string;
  customerRole: string;
  providerRole: string;
  allowedRoles: UserRole[];
  modules: Array<{
    title: string;
    description: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  pipeline: Array<{
    label: string;
    value: string;
  }>;
  tasks: string[];
};

export type FeatureSection = {
  title: string;
  slug: string;
  href: string;
  description: string;
  type: "overview" | "module" | "reports";
};

export function sectionSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFeatureSections(feature: Feature): FeatureSection[] {
  return [
    {
      title: "Overview",
      slug: "overview",
      href: feature.route,
      description: feature.description,
      type: "overview",
    },
    ...feature.modules.map((module) => ({
      title: module.title,
      slug: sectionSlug(module.title),
      href: `${feature.route}/${sectionSlug(module.title)}`,
      description: module.description,
      type: "module" as const,
    })),
    {
      title: "Reports",
      slug: "reports",
      href: `${feature.route}/reports`,
      description: `Track ${feature.label.toLowerCase()} performance, follow-up work, and operational trends.`,
      type: "reports",
    },
  ];
}

export const features: Feature[] = [
  {
    key: "rentals",
    label: "Rentals",
    shortLabel: "Homes",
    route: "/rentals",
    description:
      "A mobile-first workspace for landlords and caretakers to manage units, rent, tenants, and maintenance.",
    accountFocus: "Property and unit status, tenants, rent balances, maintenance, and lease dates.",
    dashboardTitle: "Rental Operations",
    customerRole: "Tenants track rent, receive receipts, and report maintenance from a simple portal.",
    providerRole: "Landlords and caretakers share clear records for units, payments, arrears, and requests.",
    allowedRoles: ["system_admin", "admin", "provider", "customer"],
    modules: [
      {
        title: "Property Listings",
        description: "Apartments, houses, rooms, prices, amenities, location, and availability.",
      },
      {
        title: "Viewing Requests",
        description: "Customer visit requests, provider confirmations, rescheduling, and no-shows.",
      },
      {
        title: "Applications",
        description: "Tenant profiles, documents, screening state, and landlord decisions.",
      },
      {
        title: "Leases",
        description: "Offer terms, deposits, lease milestones, move-in dates, and renewal reminders.",
      },
      {
        title: "Rent Payments",
        description: "Record manual rent, print receipts, track unit balances, and review arrears aging.",
      },
    ],
    stats: [
      { label: "Units", value: "10", detail: "Across 1 property" },
      { label: "Occupied", value: "8", detail: "2 units vacant" },
      { label: "Rent overdue", value: "KES 45,000", detail: "Needs follow-up" },
    ],
    pipeline: [
      { label: "Open maintenance requests", value: "3" },
      { label: "Vacant units", value: "2" },
      { label: "Viewing requests", value: "4" },
      { label: "Overdue rent", value: "KES 45,000" },
    ],
    tasks: [
      "Follow up on overdue rent",
      "Review open maintenance requests",
      "Confirm pending viewings",
    ],
  },
  {
    key: "warehouses",
    label: "Warehouses",
    shortLabel: "Storage",
    route: "/warehouse",
    description:
      "A storage marketplace connecting customers who need space with warehouse owners and operators.",
    accountFocus: "Storage requests, capacity matching, access rules, transport needs, and contracts.",
    dashboardTitle: "Warehouse Leasing Overview",
    customerRole: "Customers request storage by size, duration, goods type, access needs, and location.",
    providerRole: "Warehouse operators publish capacity, quote customers, manage access, and coordinate logistics.",
    allowedRoles: ["system_admin", "admin", "provider", "customer"],
    modules: [
      {
        title: "Storage Requests",
        description: "Customer demand by square meters, goods category, duration, and urgency.",
      },
      {
        title: "Warehouse Listings",
        description: "Buildings, bays, loading access, security, location, and available capacity.",
      },
      {
        title: "Logistics Support",
        description: "Vehicle needs, loading windows, pickup notes, and delivery coordination.",
      },
      {
        title: "Contracts",
        description: "Quotes, accepted terms, recurring billing, access rules, and expiry dates.",
      },
    ],
    stats: [
      { label: "Storage bays", value: "22", detail: "14 with loading access" },
      { label: "Capacity booked", value: "64%", detail: "11,400 sqm occupied" },
      { label: "Active inquiries", value: "39", detail: "8 requesting long-term terms" },
    ],
    pipeline: [
      { label: "Space requests", value: "16" },
      { label: "Site visits", value: "9" },
      { label: "Quote sent", value: "6" },
      { label: "Contracts", value: "4" },
    ],
    tasks: [
      "Verify available square meters by warehouse",
      "Send rates for long-term storage requests",
      "Flag units that need security inspection",
    ],
  },
];

export const defaultFeature = features[0];
