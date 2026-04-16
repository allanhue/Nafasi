'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '../lib/useLogout';
import { useRoleBasedNavigation } from '../lib/useRoleBasedNavigation';
import LogoutModal from './logout-modal';
import {
  User,
  LogOut,
  Building,
  Bell,
  BarChart3,
  Settings,
  AlertCircle,
} from 'lucide-react';

type UserProfile = {
  name: string;
  email: string;
  avatar: string;
};

export default function Sidebar({
  user,
}: {
  user: UserProfile;
}) {
  const pathname = usePathname();
  const { logout, isLoading } = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { navItems, canAccessOrganizations } = useRoleBasedNavigation();

  const handleLogoutConfirm = async () => {
    await logout();
  };

  const avatarIsImage =
    typeof user.avatar === 'string' &&
    (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/'));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span className="brand-name">nafasi</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
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

        {canAccessOrganizations && (
          <Link href="/organizations" className={`nav-link${pathname === '/organizations' || pathname.startsWith('/organizations/') ? ' active' : ''}`}>
            <Building size={20} className="nav-icon" />
            <span>Organizations</span>
          </Link>
        )}

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
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        <LogoutModal
          isOpen={showLogoutConfirm}
          isLoading={isLoading}
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          userName={user.name}
        />
      </div>
    </aside>
  );
}
