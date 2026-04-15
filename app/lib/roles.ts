export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  LANDLORD: 'landlord',
  TENANT: 'tenant', // Invited by landlord to rent a house
  SPACE_MANAGER: 'space_manager',
  USER: 'user', // Self-registered, books spaces or buys tickets
  HOUSE_SEEKER: 'house_seeker', // Looking for a house to rent (registered by landlord)
  User: 'user',
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
  },
  [ROLES.WAREHOUSE_MANAGER]: {
    canAccessOrganizations: false,
    canManageInventory: true,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: false,
    canManageUsers: false,
    canInviteTenants: false,
  },
  [ROLES.LANDLORD]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: true,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: true, // Can invite people to become tenants
  },
  [ROLES.TENANT]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
  },
  [ROLES.SPACE_MANAGER]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: true,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
  },
  [ROLES.USER]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
  },
  [ROLES.HOUSE_SEEKER]: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: false,
    canManageUsers: false,
    canInviteTenants: false,
  },
  user: {
    canAccessOrganizations: false,
    canManageInventory: false,
    canManageRentals: false,
    canManageSpaces: false,
    canViewTickets: true,
    canManageUsers: false,
    canInviteTenants: false,
  },
};

export function getUserPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role] || rolePermissions[ROLES.USER];
}

export function canAccess(role: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getUserPermissions(role);
  return permissions[permission];
}

export const roleLabels: Record<UserRole, string> = {
  [ROLES.SYSTEM_ADMIN]: 'System Admin',
  [ROLES.WAREHOUSE_MANAGER]: 'Warehouse Manager',
  [ROLES.LANDLORD]: 'Landlord',
  [ROLES.TENANT]: 'Tenant',
  [ROLES.SPACE_MANAGER]: 'Space Manager',
  [ROLES.USER]: 'User',
  [ROLES.HOUSE_SEEKER]: 'House Seeker',
  user: 'User',
};

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role] || 'User';
}

export const roleDescriptions: Record<UserRole, string> = {
  [ROLES.SYSTEM_ADMIN]: 'Full platform access, manages organizations and all features',
  [ROLES.WAREHOUSE_MANAGER]: 'Manages inventory, warehouses, and product movements',
  [ROLES.LANDLORD]: 'Manages rental properties and can invite tenants',
  [ROLES.TENANT]: 'Rents properties from landlords',
  [ROLES.SPACE_MANAGER]: 'Manages spaces available for booking',
  [ROLES.USER]: 'Searches and books spaces, buys tickets',
  [ROLES.HOUSE_SEEKER]: 'Looking for a house to rent via landlord invitation',
  user: 'Basic user access',
};

export function getRoleDescription(role: UserRole): string {
  return roleDescriptions[role] || 'User account';
} 
