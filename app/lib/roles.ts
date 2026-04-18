'use client';

import { useMemo } from 'react';
import { readSession } from './session';
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

/* ============================================================
   ROLE DEFINITIONS
   ============================================================ */

export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  SPACE_MANAGER: 'space_manager',
  USER: 'user',
  HOUSE_SEEKER: 'house_seeker',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface RolePermissions {
  canAccessOrganizations: boolean;
  canManageInventory: boolean;
  canManageRentals: boolean;
  canManageSpaces: boolean;
  canViewTickets: boolean;
  canManageUsers: boolean;
  canInviteTenants: boolean;
  canAccessAdmin: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  [ROLES.SYSTEM_ADMIN]: {
    canAccessOrganizations: true,
    canManageInventory: true,
    canManageRentals: true,
    canManageSpaces: true,
    canViewTickets: true,
    canManageUsers: true,
    canInviteTenants: true,
    canAccessAdmin: true,
  },
  [ROLES.WAREHOUSE_MANAGER]: {
    canAccessOrganizations: false,
    canManageInventory: true,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: false,
    canManageUsers: false,
    canInviteTenants: false,
    canAccessAdmin: false,
  },
  [ROLES.LANDLORD]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: true,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: true,
    canAccessAdmin: false,
  },
  [ROLES.TENANT]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
    canAccessAdmin: false,
  },
  [ROLES.SPACE_MANAGER]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: true,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
    canAccessAdmin: false,
  },
  [ROLES.USER]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
    canAccessAdmin: false,
  },
  [ROLES.HOUSE_SEEKER]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: false,
    canManageUsers: false,
    canInviteTenants: false,
    canAccessAdmin: false,
  },
};

/* ============================================================
   PERMISSION HELPERS
   ============================================================ */

export function getUserPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role] || rolePermissions[ROLES.USER];
}

export function canAccess(role: UserRole, permission: keyof RolePermissions): boolean {
  const perms = rolePermissions[role] || rolePermissions[ROLES.USER];
  return perms[permission] === true;
}

/* ============================================================
   NAVIGATION TYPES & INTERFACES
   ============================================================ */

export interface NavItem {
  label: string;
  short: string;
  href: string;
  icon: LucideIcon;
  requiredPermission: keyof RolePermissions | null;
}

/* ============================================================
   NAVIGATION HOOK (Consolidated)
   ============================================================ */

export function useRoleBasedNavigation(providedRole?: string | null) {
  return useMemo(() => {
    let userRole: UserRole;
    
    if (providedRole) {
      // Use provided role if available (e.g., from parent component)
      userRole = (providedRole as UserRole) || ROLES.USER;
    } else {
      // Fall back to reading from session
      const session = readSession();
      userRole = (session?.role as UserRole) || ROLES.USER;
    }

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
        label: 'Reports',
        short: 'R',
        href: '/inventory/reports',
        icon: BarChart3,
        requiredPermission: 'canManageInventory',
      },
      {
        label: 'Spaces',
        short: 'SP',
        href: '/bookings',
        icon: Target,
        requiredPermission: 'canManageSpaces',
      },
      {
        label: 'Bookings',
        short: 'B',
        href: '/bookings/manage',
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
      {
        label: 'Tickets',
        short: 'TK',
        href: '/administrator/tickets',
        icon: Ticket,
        requiredPermission: 'canViewTickets',
      },
      {
        label: 'Admin Panel',
        short: 'A',
        href: '/administrator/dashboard',
        icon: Building,
        requiredPermission: 'canAccessAdmin',
      },
    ];

    // Filter items based on user permissions
    const navItems = allNavItems.filter(item => {
      if (item.requiredPermission === null) return true;
      return canAccess(userRole, item.requiredPermission);
    });

    const permissions = getUserPermissions(userRole);

    return {
      navItems,
      permissions,
      userRole,
      canAccessOrganizations: permissions.canAccessOrganizations,
    };
  }, [providedRole]);
}
