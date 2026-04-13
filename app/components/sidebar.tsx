'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ChevronDown,
  ChevronUp,
  Check,
  Building2,
  Boxes,
  MapPin
} from 'lucide-react';
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
};

// Updated Meta to use Lucide Components
type ContextMeta = Record<ServiceContext, { label: string; color: string; icon: any }>;

const CONTEXT_META_CONFIG: ContextMeta = {
  rental: { label: 'Rentals', color: '#3b82f6', icon: Building2 },
  inventory: { label: 'Inventory', color: '#10b981', icon: Boxes },
  spaces: { label: 'Spaces', color: '#f59e0b', icon: MapPin },
};

function ContextSwitcher({
  user,
  onSwitch,
}: {
  user: UserProfile;
  onSwitch: (ctx: ServiceContext) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = CONTEXT_META_CONFIG[user.activeContext];
  const Icon = meta.icon;

  return (
    <div className="context-switcher">
      <button className="context-trigger" onClick={() => setOpen(value => !value)}>
        <Icon size={20} />
        <span className="context-label" style={{ color: meta.color }}>{meta.label}</span>
        <span className="context-caret">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      
      {open && (
        <div className="context-menu">
          {user.contexts.map(ctx => {
            const item = CONTEXT_META_CONFIG[ctx];
            const ItemIcon = item.icon;
            return (
              <button
                key={ctx}
                className={`context-item${ctx === user.activeContext ? ' active' : ''}`}
                onClick={() => {
                  onSwitch(ctx);
                  setOpen(false);
                }}
              >
                <ItemIcon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {ctx === user.activeContext && <Check size={14} />}
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
  onContextChange,
}: {
  user: UserProfile;
  navItems: NavItem[];
  onContextChange: (ctx: ServiceContext) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push('/auth/login');
  };

  // Modern Icon Mapping
  const iconMap: Record<string, any> = {
    'Dashboard': LayoutDashboard,
    'Properties': Home,
    'Tenants': Users,
    'Payments': CircleDollarSign,
    'Maintenance': Wrench,
    'Warehouses': Package,
    'Inventory': ClipboardList,
    'Movements': RefreshCw,
    'Bookings': Target,
    'Calendar': Calendar,
    'Earnings': Banknote,
    'Reports': BarChart3,
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span className="brand-name">nafasi</span>
        </Link>
        <ContextSwitcher user={user} onSwitch={onContextChange} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = iconMap[item.label] || Target;
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
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

        <Link href="/notifications" className="nav-link">
          <Bell size={20} className="nav-icon" />
          <span>Notifications</span>
        </Link>

        <Link href="/reports" className="nav-link">
          <BarChart3 size={20} className="nav-icon" />
          <span>Reports</span>
        </Link>

        <Link href="/profile" className="nav-link">
          <Settings size={20} className="nav-icon" />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar">
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : <User size={20} />}
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