'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './globals.css';
import Sidebar from './components/sidebar';
import NavBar from './components/nav_bar';
import Footer from './components/footer';
import { usePathname, useRouter } from 'next/navigation';
import { readSession } from './lib/session';
import { ROLES } from './lib/roles';

type ServiceContext = 'rental' | 'inventory' | 'spaces' | 'admin';

type UserProfile = {
  name: string;
  email: string;
  avatar: string;
  contexts: ServiceContext[];
  activeContext: ServiceContext;
};

type NavItem = {
  label: string;
  short: string;
  href: string;
  icon?: string;
};

const NAV_ITEMS: Record<ServiceContext, NavItem[]> = {
  rental: [
    { label: 'Dashboard', short: 'DB', href: '/dashboard' },
    { label: 'Properties', short: 'PR', href: '/rentals' },
    { label: 'Tenants', short: 'TN', href: '/rentals/tenants' },
    { label: 'Payments', short: 'PY', href: '/rentals/payments' },
    { label: 'Maintenance', short: 'MT', href: '/rentals/maintenance' },
  ],
  inventory: [
    { label: 'Dashboard', short: 'DB', href: '/dashboard' },
    { label: 'Inventory', short: 'IV', href: '/inventory' },
    { label: 'Warehouses', short: 'WH', href: '/inventory/warehouses' },
    { label: 'Movements', short: 'MV', href: '/inventory/movements' },
    { label: 'Reports', short: 'RP', href: '/inventory/reports' },
  ],
  spaces: [
    { label: 'Dashboard', short: 'DB', href: '/dashboard' },
    { label: 'Spaces', short: 'SP', href: '/bookings' },
    { label: 'Bookings', short: 'BK', href: '/bookings/manage' },
    { label: 'Calendar', short: 'CL', href: '/bookings/calendar' },
    { label: 'Earnings', short: 'ER', href: '/bookings/earnings' },
  ],
  admin: [
    { label: 'Dashboard', short: 'DB', href: '/administrator/dashboard' },
    { label: 'Payments', short: 'PY', href: '/administrator/payments' },
    { label: 'Tickets', short: 'TK', href: '/administrator/tickets' },
    { label: 'Calendar', short: 'CL', href: '/administrator/calendar' },
  ],
};

const CONTEXT_META: Record<ServiceContext, { label: string; color: string; dot: string }> = {
  rental: { label: 'Rental', color: 'var(--rental-color)', dot: '#1A6B4A' },
  inventory: { label: 'Inventory', color: 'var(--inventory-color)', dot: '#A05C1A' },
  spaces: { label: 'Spaces', color: 'var(--spaces-color)', dot: '#1A4A8A' },
  admin: { label: 'Admin', color: 'var(--admin-color)', dot: '#B91C1C' },
};

const CONTEXT_HOME: Record<ServiceContext, string> = {
  rental: '/dashboard',
  inventory: '/inventory',
  spaces: '/bookings',
  admin: '/administrator/dashboard',
};

const DEFAULT_USER: UserProfile = {
  name: 'User',
  email: 'user@example.com',
  avatar: 'U',
  contexts: ['rental', 'inventory', 'spaces'],
  activeContext: 'rental',
};

const STORAGE_ACTIVE_CONTEXT = 'nafasi_active_context';
const lastPathKey = (ctx: ServiceContext) => `nafasi_last_path_${ctx}`;

function inferContextFromPath(pathname: string | null): ServiceContext | null {
  if (!pathname) return null;
  if (pathname.startsWith('/administrator')) return 'admin';
  if (pathname.startsWith('/inventory')) return 'inventory';
  if (pathname.startsWith('/bookings')) return 'spaces';
  if (pathname.startsWith('/rentals')) return 'rental';
  return null;
}

function allowedContextsForRole(role?: string | null): ServiceContext[] {
  switch (role) {
    case ROLES.SYSTEM_ADMIN:
      return ['admin', 'rental', 'inventory', 'spaces'];
    case ROLES.USER:
      return ['rental', 'inventory', 'spaces'];
    case ROLES.WAREHOUSE_MANAGER:
      return ['inventory'];
    case ROLES.SPACE_MANAGER:
      return ['spaces'];
    case ROLES.LANDLORD:
      return ['rental'];
    case ROLES.TENANT:
      return ['rental'];
    default:
      return ['rental', 'inventory', 'spaces'];
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    const role = session?.role;
    const inferred = inferContextFromPath(pathname);

    const allowed = new Set<ServiceContext>(allowedContextsForRole(role));
    if (inferred === 'admin') allowed.add('admin');

    const ordered: ServiceContext[] = ['admin', 'rental', 'inventory', 'spaces'];
    const contexts = ordered.filter((ctx) => allowed.has(ctx));
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_ACTIVE_CONTEXT) : null;

    const preferred =
      (saved as ServiceContext | null) && contexts.includes(saved as ServiceContext)
        ? (saved as ServiceContext)
        : inferred && contexts.includes(inferred)
          ? inferred
          : contexts[0] || DEFAULT_USER.activeContext;

    const displayName = session?.user?.name || session?.user?.email || DEFAULT_USER.name;
    const email = session?.user?.email || DEFAULT_USER.email;

    setUser(prev => ({
      ...prev,
      name: displayName,
      email,
      avatar: (displayName || 'U').substring(0, 1).toUpperCase(),
      contexts,
      activeContext: preferred,
    }));

    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    const inferred = inferContextFromPath(pathname);
    if (!inferred) return;

    // Keep the last visited page per workspace to make switching feel "smart".
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(lastPathKey(inferred), pathname);
    }

    setUser(current => {
      if (current.activeContext === inferred) return current;
      if (!current.contexts.includes(inferred)) return current;
      return { ...current, activeContext: inferred };
    });
  }, [pathname]);

  const setActiveContext = useCallback(
    (ctx: ServiceContext) => {
      setUser(current => {
        if (current.activeContext === ctx) return current;
        if (!current.contexts.includes(ctx)) return current;
        return { ...current, activeContext: ctx };
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_ACTIVE_CONTEXT, ctx);
        const last = window.localStorage.getItem(lastPathKey(ctx));
        const target = last || CONTEXT_HOME[ctx];
        if (target && target !== pathname) {
          router.push(target);
        }
      } else {
        router.push(CONTEXT_HOME[ctx]);
      }
    },
    [pathname, router],
  );

  const activeMeta = useMemo(() => CONTEXT_META[user.activeContext], [user.activeContext]);
  const navItems = NAV_ITEMS[user.activeContext];

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="app-shell">
          <Sidebar
            user={user}
            navItems={navItems}
            contextMeta={CONTEXT_META}
            onContextChange={setActiveContext}
          />
          <div className="page-content">
            <NavBar
              user={user}
              contexts={user.contexts}
              activeContext={user.activeContext}
              onContextChange={setActiveContext}
              isLoading={isLoading}
            />
            <main className="page-main animate-in">{children}</main>
            <Footer activeMeta={activeMeta} />
          </div>
        </div>
      </body>
    </html>
  );
}
