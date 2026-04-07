'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
};

type ContextMeta = Record<ServiceContext, { label: string; color: string; dot: string }>;

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
        <span className="context-dot" style={{ background: meta.dot }} />
        <span className="context-label" style={{ color: meta.color }}>{meta.label}</span>
        <span className="context-caret">v</span>
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
                style={{ color: item.color }}
              >
                <span className="context-dot" style={{ background: item.dot }} />
                {item.label}
                {ctx === user.activeContext ? <span className="context-check">ok</span> : null}
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
              <span className="nav-icon">{item.short}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-divider" />

        <Link href="/profile" className="nav-link">
          <span className="nav-icon">ST</span>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{user.avatar}</div>
        <div className="user-meta">
          <p className="user-name">{user.name}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <Link href="/profile" className="icon-button" aria-label="Open profile">
          PR
        </Link>
      </div>
    </aside>
  );
}
