'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  User, 
  LogOut,
  Building
} from 'lucide-react';
import { useLogout } from '../lib/useLogout';

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
};

export default function Sidebar({
  user,
  navItems,
  contextMeta,
  onContextChange,
}: {
  user: UserProfile;
  navItems: NavItem[];
  contextMeta?: Record<ServiceContext, { label: string; color: string; dot: string }>;
  onContextChange?: (ctx: ServiceContext) => void;
}) {
  const pathname = usePathname();
  const logout = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const iconMap: Record<string, any> = {
    'Dashboard': LayoutDashboard,
    'Properties': Home,
    'Tenants': Users,
    'Payments': CircleDollarSign,
    'Maintenance': Wrench,
    'Warehouses': Package,
    'Inventory': ClipboardList,
    'Products': ClipboardList,
    'Movements': RefreshCw,
    'Bookings': Target,
    'Calendar': Calendar,
    'Earnings': Banknote,
    'Reports': BarChart3,
    'Tickets': Target,
  };

  const avatarIsImage =
    typeof user.avatar === 'string' &&
    (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/'));

  const activeMeta = contextMeta ? contextMeta[user.activeContext] : null;

  return (
    <aside className="sidebar">
      {/* Fixed: Added missing closing div for sidebar-header */}
      <div className="sidebar-header">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span className="brand-name">nafasi</span>
        </Link>
        {activeMeta ? (
          <div
            className={`context-tag context-${user.activeContext}`}
            aria-label={`Active workspace: ${activeMeta.label}`}
            title={`Active workspace: ${activeMeta.label}`}
          >
            <span className="workspace-dot" style={{ background: activeMeta.color }} />
            <span>{activeMeta.label}</span>
          </div>
        ) : null}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = iconMap[item.label] || Target;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active ? ' active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-divider" />

        <Link href="/notifications" className={`nav-link${pathname === '/notifications' ? ' active' : ''}`}>
          <Bell size={20} className="nav-icon" />
          <span>Notifications</span>
        </Link>

        <Link
          href="/reports"
          className={`nav-link${pathname === '/reports' || pathname.startsWith('/reports/') ? ' active' : ''}`}
        >
          <BarChart3 size={20} className="nav-icon" />
          <span>Reports</span>
        </Link>

        <Link
          href="/profile"
          className={`nav-link${pathname === '/profile' || pathname.startsWith('/profile/') ? ' active' : ''}`}
        >
          <Settings size={20} className="nav-icon" />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar">
            {avatarIsImage ? <img src={user.avatar} alt={user.name} /> : (user.avatar || 'U')}
          </div>
          <div className="user-meta">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/profile" className="icon-button" title="Profile">
            <User size={18} />
          </Link>
          <button
            className="icon-button logout-button"
            title="Logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Fixed: Corrected the closing braces for this conditional block */}
        {showLogoutConfirm && (
          <div className="logout-confirm">
            <p>Are you sure?</p>
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
