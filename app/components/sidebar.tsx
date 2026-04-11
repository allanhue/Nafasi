'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession } from '../lib/session';

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
  icon: string;
};

type ContextMeta = Record<ServiceContext, { label: string; color: string; dot: string; icon: string }>;

function ContextSwitcher({
  user,
  contextMeta,
  onSwitch,
}: {
  user: UserProfile;
  contextMeta: ContextMeta;
  onSwitch: (ctx: ServiceContext) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = contextMeta[user.activeContext];

  return (
    <div className="context-switcher">
      <button className="context-trigger" onClick={() => setOpen(value => !value)}>
        <span className="text-2xl">{meta.icon}</span>
        <span className="context-label" style={{ color: meta.color }}>{meta.label}</span>
        <span className="context-caret">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="context-menu">
          {user.contexts.map(ctx => {
            const item = contextMeta[ctx];
            return (
              <button
                key={ctx}
                className={`context-item${ctx === user.activeContext ? ' active' : ''}`}
                onClick={() => {
                  onSwitch(ctx);
                  setOpen(false);
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {ctx === user.activeContext ? <span>✓</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  user,
  navItems,
  contextMeta,
  onContextChange,
}: {
  user: UserProfile;
  navItems: NavItem[];
  contextMeta: ContextMeta;
  onContextChange: (ctx: ServiceContext) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push('/auth/login');
  };

  const iconMap: Record<string, string> = {
    'Dashboard': '📊',
    'Properties': '🏠',
    'Tenants': '👥',
    'Payments': '💰',
    'Maintenance': '🔧',
    'Warehouses': '📦',
    'Inventory': '📋',
    'Movements': '🔄',
    'Bookings': '🎯',
    'Calendar': '📅',
    'Earnings': '💵',
    'Reports': '📈',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span className="brand-name">nafasi</span>
        </Link>
        <ContextSwitcher user={user} contextMeta={contextMeta} onSwitch={onContextChange} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active ? ' active' : ''}`}
            >
              <span className="nav-icon">{iconMap[item.label] || '◆'}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-divider" />

        <Link href="/notifications" className="nav-link">
          <span className="nav-icon">🔔</span>
          <span>Notifications</span>
        </Link>

        <Link href="/reports" className="nav-link">
          <span className="nav-icon">📈</span>
          <span>Reports</span>
        </Link>

        <Link href="/profile" className="nav-link">
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar">{user.avatar}</div>
          <div className="user-meta">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/profile" className="icon-button" aria-label="Open profile" title="Profile">
            👤
          </Link>
          <button
            className="icon-button logout-button"
            aria-label="Logout"
            title="Logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            🚪
          </button>
        </div>

        {showLogoutConfirm && (
          <div className="logout-confirm">
            <p>Are you sure you want to logout?</p>
            <div className="confirm-buttons">
              <button onClick={handleLogout} className="btn-primary">Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
