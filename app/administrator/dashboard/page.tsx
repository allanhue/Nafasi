'use client';

import Link from 'next/link';
import { Clock, Users, DollarSign, AlertTriangle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = 'high' | 'medium' | 'low';
type Status = 'up' | 'down' | 'neutral';
type HealthStatus = 'good' | 'warning';
type SignupStatus = 'active' | 'pending';

interface Stat {
  label: string;
  value: string;
  delta: string;
  status: Status;
  icon: React.ReactNode;
}

interface PlatformHealth {
  label: string;
  value: string;
  status: HealthStatus;
  detail: string;
}

interface RecentSignup {
  name: string;
  plan: string;
  joined: string;
  owner: string;
  status: SignupStatus;
}

interface AdminTask {
  label: string;
  count: number;
  href: string;
  priority: Priority;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS: Stat[] = [
  { label: 'Active customers', value: '412',      delta: '+18', status: 'up',      icon: <Users size={18} /> },
  { label: 'Monthly revenue',  value: 'KES 4.8M', delta: '+6%', status: 'up',      icon: <DollarSign size={18} /> },
  { label: 'Churn risk',       value: '12',       delta: '-3',  status: 'down',    icon: <AlertTriangle size={18} /> },
  { label: 'Open tickets',     value: '19',       delta: '+2',  status: 'neutral', icon: <Clock size={18} /> },
];

const PLATFORM_HEALTH: PlatformHealth[] = [
  { label: 'API latency',      value: '220ms',     status: 'good',    detail: 'Optimal' },
  { label: 'Background jobs',  value: '2 running', status: 'good',    detail: '0 failed' },
  { label: 'Email queue',      value: '7 pending', status: 'warning', detail: '3 retries' },
  { label: 'Database',         value: '85% usage', status: 'good',    detail: 'Below threshold' },
];

const RECENT_SIGNUPS: RecentSignup[] = [
  { name: 'Nairobi Homes',       plan: 'Pro',        joined: 'Today',     owner: 'Grace W.',  status: 'active' },
  { name: 'Juja Stores',         plan: 'Starter',    joined: 'Yesterday', owner: 'Peter O.',  status: 'active' },
  { name: 'Coastline Venues',    plan: 'Pro',        joined: '2 days ago',owner: 'Farah A.',  status: 'active' },
  { name: 'Ridgeway Apartments', plan: 'Enterprise', joined: '3 days ago',owner: 'David M.',  status: 'pending' },
];

const ADMIN_TASKS: AdminTask[] = [
  { label: 'Review KYC documents', count: 6, href: '/administrator/kyc',      priority: 'high' },
  { label: 'Approve payouts',       count: 3, href: '/administrator/payouts',  priority: 'high' },
  { label: 'Resolve escalations',   count: 2, href: '/administrator/tickets',  priority: 'medium' },
  { label: 'Database maintenance',  count: 1, href: '/administrator/system',   priority: 'low' },
];

const QUICK_LINKS = [
  { label: 'Payments', href: '/administrator/payments', icon: '💳' },
  { label: 'Tickets',  href: '/administrator/tickets',  icon: '🎫' },
  { label: 'Calendar', href: '/administrator/calendar', icon: '📅' },
  { label: 'Users',    href: '/rentals/tenants',        icon: '👥' },
];

// ─── Colour helpers ───────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<Priority, { text: string; bg: string }> = {
  high:   { text: 'var(--status-danger)',   bg: 'rgba(239,68,68,0.1)' },
  medium: { text: 'var(--status-warning)',  bg: 'rgba(234,179,8,0.1)' },
  low:    { text: 'var(--text-muted)',      bg: 'rgba(107,114,128,0.1)' },
};

const SIGNUP_COLORS: Record<SignupStatus, { text: string; bg: string; border: string }> = {
  active:  { text: 'var(--status-success)', bg: 'rgba(34,197,94,0.1)',  border: 'var(--status-success)' },
  pending: { text: 'var(--status-warning)', bg: 'rgba(234,179,8,0.1)', border: 'var(--status-warning)' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: Stat }) {
  const deltaColor =
    stat.status === 'up'   ? 'var(--status-success)' :
    stat.status === 'down' ? 'var(--status-danger)'  :
    'var(--text-muted)';

  const arrow = stat.status === 'up' ? '↑' : stat.status === 'down' ? '↓' : '→';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {stat.label}
        </p>
        <span style={{ opacity: 0.6, color: 'var(--text-secondary)' }}>{stat.icon}</span>
      </div>

      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {stat.value}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: deltaColor }}>
          {arrow} {stat.delta}
        </p>
      </div>
    </div>
  );
}

function HealthRow({ health }: { health: PlatformHealth }) {
  const color = health.status === 'good' ? 'var(--status-success)' : 'var(--status-warning)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      background: 'var(--bg-subtle)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{health.label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{health.detail}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color }}>{health.value}</p>
        <div style={{ marginTop: 4, width: 8, height: 8, borderRadius: '50%', background: color, marginLeft: 'auto' }} />
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: AdminTask }) {
  const { text, bg } = PRIORITY_COLORS[task.priority];

  return (
    <Link href={task.href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = 'var(--bg-muted)';
          el.style.borderColor = 'var(--border-default)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = 'var(--bg-subtle)';
          el.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: text, fontSize: 12, fontWeight: 700,
          }}>
            {task.count}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{task.label}</span>
        </div>

        <span style={{
          fontSize: 10, padding: '4px 8px', borderRadius: 4,
          background: bg, color: text, fontWeight: 600, textTransform: 'capitalize',
        }}>
          {task.priority}
        </span>
      </div>
    </Link>
  );
}

function SignupCard({ signup }: { signup: RecentSignup }) {
  const { text, bg, border } = SIGNUP_COLORS[signup.status];

  return (
    <div style={{
      padding: '10px 12px',
      background: 'var(--bg-subtle)',
      borderRadius: 'var(--radius-md)',
      borderLeft: `3px solid ${border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <p style={{ fontSize: 12, fontWeight: 600 }}>{signup.name}</p>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: bg, color: text, fontWeight: 500 }}>
          {signup.status}
        </span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{signup.plan} • {signup.joined}</p>
      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Owner: {signup.owner}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdministratorDashboardPage() {
  const highPriorityCount = ADMIN_TASKS.filter(t => t.priority === 'high').length;

  return (
    <div>
      <div className="page-header">
        <h1>Administrator Dashboard</h1>
        <p>System overview, platform health, and business metrics.</p>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {STATS.map(stat => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Platform Health */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Platform Health</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated now</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLATFORM_HEALTH.map(h => (
                <HealthRow key={h.label} health={h} />
              ))}
            </div>
          </div>

          {/* Admin Action Items */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Admin Action Items</span>
              <span style={{ fontSize: 12, color: 'var(--status-danger)', fontWeight: 500 }}>
                {highPriorityCount} high priority
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ADMIN_TASKS.map(task => (
                <TaskRow key={task.href} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Quick Actions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_LINKS.map(link => (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 10, fontSize: 13 }}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Recent Signups</span>
              <span style={{ fontSize: 12, color: 'var(--status-success)', fontWeight: 500 }}>
                +{RECENT_SIGNUPS.length} this week
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECENT_SIGNUPS.slice(0, 3).map(signup => (
                <SignupCard key={signup.name} signup={signup} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}