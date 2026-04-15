'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readSession } from './session';
import { canAccess, UserRole, ROLES } from './roles';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: keyof import('./roles').RolePermissions;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    
    if (!session?.token) {
      router.replace('/auth/login');
      return;
    }

    const userRole = (session.role as UserRole) || ROLES.USER;

    // Check permission
    let hasAccess = true;
    if (requiredPermission) {
      hasAccess = canAccess(userRole, requiredPermission);
    }

    // Check specific roles
    if (hasAccess && requiredRoles && requiredRoles.length > 0) {
      hasAccess = requiredRoles.includes(userRole);
    }

    setIsAuthorized(hasAccess);
    setIsLoading(false);

    if (!hasAccess) {
      router.replace('/unauthorized');
    }
  }, [router, requiredPermission, requiredRoles]);

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  return isAuthorized ? children : fallback;
}
