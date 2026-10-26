import {
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileText,
  LayoutDashboard,
  PackageSearch,
  Pencil,
  Settings,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

const sectionIcons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  "property-listings": Building2,
  "warehouse-listings": Warehouse,
  "viewing-requests": Eye,
  "storage-requests": PackageSearch,
  "space-requests": ClipboardList,
  "logistics-support": Truck,
  applications: ClipboardCheck,
  leases: FileText,
  contracts: FileText,
  reports: ChartNoAxesColumn,
};

export function getIconForSection(slug: string) {
  const Icon = sectionIcons[slug] ?? LayoutDashboard;
  return <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

export function HelpIcon() {
  return <CircleQuestionMark aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

export function ChevronLeftIcon() {
  return <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

export function ChevronRightIcon() {
  return <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

export function PencilIcon() {
  return <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />;
}

export function SettingsIcon() {
  return <Settings aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

export function CalendarIcon() {
  return <CalendarDays aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}
