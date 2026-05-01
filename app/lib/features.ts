export type UserRole = "system_admin" | "admin" | "provider" | "customer";

export type FeatureKey = "rentals" | "warehouses" | "spaces";

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
      href: `${feature.route}/section?item=${sectionSlug(module.title)}`,
      description: module.description,
      type: "module" as const,
    })),
    {
      title: "Reports",
      slug: "reports",
      href: `${feature.route}/section?item=reports`,
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
      "A leasing marketplace for customers looking for homes and providers managing rentable units.",
    accountFocus: "Property discovery, viewing requests, tenant screening, lease status, and handover.",
    dashboardTitle: "Rental Portfolio Overview",
    customerRole: "Tenants search, request viewings, apply, and track lease progress.",
    providerRole: "Landlords and agents publish units, review leads, schedule viewings, and close leases.",
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
    ],
    stats: [
      { label: "Listed units", value: "48", detail: "38 currently available" },
      { label: "Tenant leads", value: "126", detail: "24 need follow-up today" },
      { label: "Occupancy", value: "82%", detail: "Up 6% from last month" },
    ],
    pipeline: [
      { label: "Viewing requests", value: "31" },
      { label: "Applications", value: "18" },
      { label: "Lease drafting", value: "7" },
      { label: "Move-ins", value: "5" },
    ],
    tasks: [
      "Review new tenant applications",
      "Confirm Saturday viewing schedule",
      "Update lease terms for expiring contracts",
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
  {
    key: "spaces",
    label: "Event Spaces",
    shortLabel: "Events",
    route: "/spaces",
    description:
      "A venue marketplace for shows, discos, pop-ups, performances, and hosted events.",
    accountFocus: "Event discovery, venue booking, ticketing, promoter updates, and show calendars.",
    dashboardTitle: "Event Space Overview",
    customerRole: "Customers discover events, reserve tickets, and contact organizers or venues.",
    providerRole: "Venue owners and promoters publish events, manage bookings, sell tickets, and post updates.",
    allowedRoles: ["system_admin", "admin", "provider", "customer"],
    modules: [
      {
        title: "Events",
        description: "Shows, discos, venue dates, performer details, capacity, and event status.",
      },
      {
        title: "Bookings",
        description: "Venue holds, confirmed bookings, setup needs, promoter requests, and calendar conflicts.",
      },
      {
        title: "Tickets",
        description: "Ticket tiers, availability, reservations, check-in state, and payment status.",
      },
      {
        title: "Blogs",
        description: "Promoter stories, event announcements, venue spotlights, and customer-facing updates.",
      },
    ],
    stats: [
      { label: "Bookable venues", value: "17", detail: "9 ready for weekend events" },
      { label: "Upcoming shows", value: "28", detail: "12 confirmed this month" },
      { label: "Booking requests", value: "54", detail: "19 awaiting venue match" },
    ],
    pipeline: [
      { label: "Promoter requests", value: "21" },
      { label: "Venue holds", value: "13" },
      { label: "Setup planning", value: "8" },
      { label: "Confirmed events", value: "12" },
    ],
    tasks: [
      "Match promoters with available venues",
      "Confirm sound and lighting requirements",
      "Check event capacity and permit notes",
    ],
  },
];

export const defaultFeature = features[0];
