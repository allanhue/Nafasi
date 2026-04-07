'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type UserProfile = {
  avatar: string;
};

function formatTitle(pathname: string) {
  if (!pathname || pathname === '/') return 'Home';
  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.replace(/[-_]/g, ' '))
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' / ');
}

export default function NavBar({
  user,
  activeMeta,
}: {
  user: UserProfile;
  activeMeta: { label: string; color: string };
}) {
  const pathname = usePathname();
  const pageTitle = formatTitle(pathname);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>{pageTitle}</span>
        <span className="topbar-context" style={{ color: activeMeta.color }}>
          {activeMeta.label}
        </span>
      </div>

      <div className="topbar-actions">
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
