'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';

type ServiceContext = 'rental' | 'inventory' | 'spaces';

type UserProfile = {
  avatar: string;
  name: string;
};

const CONTEXTS: ServiceContext[] = ['rental', 'inventory', 'spaces'];

const CONTEXT_META: Record<ServiceContext, { label: string; color: string }> = {
  rental:    { label: 'Rentals',   color: '#3b82f6' },
  inventory: { label: 'Inventory', color: '#10b981' },
  spaces:    { label: 'Spaces',    color: '#f59e0b' },
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
  activeContext,
  onContextChange,
}: {

  user: UserProfile;
  activeContext: ServiceContext;
  onContextChange: (ctx: ServiceContext) => void;
  
}) {
  const pathname = usePathname();
  const pageTitle = formatTitle(pathname);

  const safeContext: ServiceContext = CONTEXTS.includes(activeContext) ? activeContext : 'rental';
  const meta = CONTEXT_META[safeContext];
  const currentIdx = CONTEXTS.indexOf(safeContext);

  const prev = () => onContextChange(CONTEXTS[(currentIdx - 1 + CONTEXTS.length) % CONTEXTS.length]);
  const next = () => onContextChange(CONTEXTS[(currentIdx + 1) % CONTEXTS.length]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{pageTitle}</span>
      </div>

      <div className="topbar-actions">
        {/* Vertical mode switcher */}
        <div className="mode-switcher">
          <button className="mode-arrow" onClick={next} aria-label="Next mode">
            <ChevronUp size={13} />
          </button>
          <div className="mode-display">
            <span className="mode-dot" style={{ background: meta.color }} />
            <span className="mode-label" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
          <button className="mode-arrow" onClick={prev} aria-label="Previous mode">
            <ChevronDown size={13} />
          </button>
        </div>

        <div className="topbar-search">
          <input className="input" placeholder="Search" aria-label="Search" />
        </div>

        <button className="icon-button" aria-label="Notifications">
          NT
          <span className="dot" />
        </button>

        <Link href="/profile" className="avatar-link" aria-label="Open profile">
          <div className="avatar">{user.avatar}</div>
        </Link>
      </div>
    </header>
  );
}