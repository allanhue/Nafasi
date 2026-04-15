'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NotificationDrawer from './notification_drawer';

type ServiceContext = 'rental' | 'inventory' | 'spaces' | 'admin';

type UserProfile = {
  avatar: string;
  name: string;
};

const CONTEXT_META: Record<ServiceContext, { label: string; color: string; hint: string }> = {
  rental: { label: 'Rentals', color: 'var(--rental-color)', hint: 'Leases, tenants, payments' },
  inventory: { label: 'Inventory', color: 'var(--inventory-color)', hint: 'Stock, warehouses, movements' },
  spaces: { label: 'Spaces', color: 'var(--spaces-color)', hint: 'Bookings, calendar, earnings' },
  admin: { label: 'Admin', color: 'var(--admin-color)', hint: 'Platform oversight' },
};

function formatTitle(pathname: string) {
  if (!pathname || pathname === '/') return 'Home';
  return pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.replace(/[-_]/g, ' '))
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' / ');
}

export default function NavBar({
  user,
  contexts,
  activeContext,
  onContextChange,
  isLoading,
}: {
  user: UserProfile;
  contexts: ServiceContext[];
  activeContext: ServiceContext;
  onContextChange: (ctx: ServiceContext) => void;
  isLoading?: boolean;
}) {
  const pathname = usePathname();
  const pageTitle = formatTitle(pathname);

  const safeContext: ServiceContext = contexts.includes(activeContext)
    ? activeContext
    : contexts[0] || 'rental';

  const meta = CONTEXT_META[safeContext] || CONTEXT_META.rental;
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const cycleContext = useCallback(
    (direction: 1 | -1) => {
      if (contexts.length < 2) return;
      const idx = Math.max(0, contexts.indexOf(safeContext));
      const next = contexts[(idx + direction + contexts.length) % contexts.length];
      onContextChange(next);
    },
    [contexts, onContextChange, safeContext],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }

      // Alt+M cycles workspaces; hold Shift to reverse.
      if (event.altKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        cycleContext(event.shiftKey ? -1 : 1);
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cycleContext]);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!menuRef.current) return;
      if (!menuRef.current.contains(target)) setMenuOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const titleRight = useMemo(() => {
    if (isLoading) return 'Loading…';
    return user.name || 'User';
  }, [isLoading, user.name]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">{pageTitle}</span>
        </div>

        <div className="topbar-actions">
          <div className="workspace-switch" ref={menuRef}>
            <button
              type="button"
              className="workspace-button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
              title="Switch workspace (Alt+M)"
            >
              <span className={`context-tag context-${safeContext}`}>
                <span className="workspace-dot" style={{ background: meta.color }} />
                <span className="workspace-title">{meta.label}</span>
              </span>
              <ChevronDown size={14} />
            </button>

            {menuOpen ? (
              <div className="workspace-menu" role="menu" aria-label="Workspace menu">
                {contexts.map((ctx) => {
                  const itemMeta = CONTEXT_META[ctx] || CONTEXT_META.rental;
                  const active = ctx === safeContext;

                  return (
                    <button
                      key={ctx}
                      type="button"
                      role="menuitem"
                      className={`workspace-item${active ? ' active' : ''}`}
                      onClick={() => {
                        onContextChange(ctx);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="workspace-item-left">
                        <span className="workspace-dot" style={{ background: itemMeta.color }} />
                        <span>{itemMeta.label}</span>
                      </span>
                      <span className="workspace-hint">{itemMeta.hint}</span>
                    </button>
                  );
                })}
                {contexts.length > 1 ? (
                  <div className="workspace-footer" aria-hidden="true">
                    Tip: press Alt+M to switch (Shift reverses)
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="topbar-search">
            <input className="input" placeholder="Search" aria-label="Search" />
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label="Notifications"
            aria-controls="notifications-drawer"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen(open => !open)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="dot" />
          </button>

          <Link href="/profile" className="avatar-link" aria-label={`Open profile for ${titleRight}`}>
            <div className="avatar">{user.avatar}</div>
          </Link>
        </div>
      </header>

      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
