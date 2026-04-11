'use client';

import type { ReactNode } from 'react';
import { useMemo, useState, useEffect } from 'react';
import './globals.css';
import Sidebar from './components/sidebar';
import NavBar from './components/nav_bar';
import Footer from './components/footer';

type ServiceContext = 'rental' | 'inventory' | 'spaces';

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
};

const CONTEXT_META: Record<ServiceContext, { label: string; color: string; dot: string }> = {
  rental: { label: 'Rental', color: 'var(--rental-color)', dot: '#1A6B4A' },
  inventory: { label: 'Inventory', color: 'var(--inventory-color)', dot: '#A05C1A' },
  spaces: { label: 'Spaces', color: 'var(--spaces-color)', dot: '#1A4A8A' },
};

const DEFAULT_USER: UserProfile = {
  name: 'User',
  email: 'user@example.com',
  avatar: 'U',
  contexts: ['rental', 'inventory', 'spaces'],
  activeContext: 'rental',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(prev => ({
            ...prev,
            name: userData.name || userData.email || 'User',
            email: userData.email || 'user@example.com',
            avatar: (userData.name || 'U').substring(0, 1).toUpperCase(),
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const setActiveContext = (ctx: ServiceContext) => {
    setUser(current => ({ ...current, activeContext: ctx }));
  };

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
            <NavBar user={user} activeMeta={activeMeta} />
            <main className="page-main animate-in">{children}</main>
            <Footer activeMeta={activeMeta} />
          </div>
        </div>
      </body>
    </html>
  );
}
