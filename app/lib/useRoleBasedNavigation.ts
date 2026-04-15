import { useMemo } from 'react';
import { readSession } from './session';
import { canAccess, UserRole } from './roles';
import {
  LayoutDashboard,
  Home,
  Users,
  CircleDollarSign,
  Wrench,
  Package,
  ClipboardList,
  RefreshCw,
  Target,
  Calendar,
  Banknote,
  BarChart3,
  Bell,
  Settings,
  Building,
  Ticket,
  UserPlus,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  short: string;
  href: string;
  icon: LucideIcon;
  requiredPermission: keyof import('./roles').RolePermissions | null;
}

export function useRoleBasedNavigation() {
  return useMemo(() => {
    const session = readSession();
    const userRole: UserRole = (session?.role as UserRole) || 'user';

    const allNavItems: NavItem[] = [
      {
        label: 'Dashboard',
        short: 'D',
        href: '/dashboard',
        icon: LayoutDashboard,
        requiredPermission: null,
      },
      {
        label: 'Properties',
        short: 'P',
        href: '/rentals/properties',
        icon: Home,
        requiredPermission: 'canManageRentals',
      },
      {
        label: 'Tenants',
        short: 'T',
        href: '/rentals/tenants',
        icon: Users,
        requiredPermission: 'canManageRentals',
      },
      {
        label: 'Invite Tenants',
        short: 'IT',
        href: '/rentals/tenants/invite',
        icon: UserPlus,
        requiredPermission: 'canInviteTenants',
      },
      {
        label: 'Payments',
        short: 'PM',
        href: '/rentals/payments',
        icon: CircleDollarSign,
        requiredPermission: 'canManageRentals',
      },
      {
        label: 'Maintenance',
        short: 'M',
        href: '/rentals/maintenance',
        icon: Wrench,
        requiredPermission: 'canManageRentals',
      },
      {
        label: 'Warehouses',
        short: 'W',
        href: '/inventory/warehouses',
        icon: Package,
        requiredPermission: 'canManageInventory',
      },
      {
        label: 'Products',
        short: 'Pr',
        href: '/inventory/products',
        icon: ClipboardList,
        requiredPermission: 'canManageInventory',
      },
      {
        label: 'Movements',
        short: 'Mv',
        href: '/inventory/movements',
        icon: RefreshCw,
        requiredPermission: 'canManageInventory',
      },
      {
        label: 'Spaces',
        short: 'S',
        href: '/bookings',
        icon: Target,
        requiredPermission: 'canManageSpaces',
      },
      {
        label: 'Calendar',
        short: 'C',
        href: '/bookings/calendar',
        icon: Calendar,
        requiredPermission: 'canManageSpaces',
      },
      {
        label: 'Earnings',
        short: 'E',
        href: '/bookings/earnings',
        icon: Banknote,
        requiredPermission: 'canManageSpaces',
      },
    ];

    // Filter items based on permissions
    const visibleItems = allNavItems.filter((item) => {
      if (item.requiredPermission === null) return true;
      return canAccess(userRole, item.requiredPermission);
    });

    return {
      navItems: visibleItems,
      userRole,
      canAccessOrganizations: canAccess(userRole, 'canAccessOrganizations'),
      canManageUsers: canAccess(userRole, 'canManageUsers'),
    };
  }, []);
}
