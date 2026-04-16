'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

type Stat = {
  label: string;
  value: string;
  delta: string;
  status: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
};

const STATS: Stat[] = [
  { label: 'Active customers', value: '412', delta: '+18', status: 'up', icon: <Users size={20} /> },
  { label: 'Monthly revenue', value: 'KES 4.8M', delta: '+6%', status: 'up', icon: <DollarSign size={20} /> },
  { label: 'Churn risk', value: '12', delta: '-3', status: 'down', icon: <AlertTriangle size={20} /> },
  { label: 'Open tickets', value: '19', delta: '+2', status: 'neutral', icon: <Clock size={20} /> },
];

const PLATFORM_HEALTH = [
  { label: 'API latency', value: '220ms', status: 'good' as const, detail: 'Optimal' },
  { label: 'Background jobs', value: '2 running', status: 'good' as const, detail: '0 failed' },
  { label: 'Email queue', value: '7 pending', status: 'warning' as const, detail: '3 retries' },
  { label: 'Database', value: '85% usage', status: 'good' as const, detail: '← threshold' },
];

const RECENT_SIGNUPS = [
  { name: 'Nairobi Homes', plan: 'Pro', joined: 'Today', owner: 'Grace W.', status: 'active' as const },
  { name: 'Juja Stores', plan: 'Starter', joined: 'Yesterday', owner: 'Peter O.', status: 'active' as const },
  { name: 'Coastline Venues', plan: 'Pro', joined: '2 days ago', owner: 'Farah A.', status: 'active' as const },
  { name: 'Ridgeway Apartments', plan: 'Enterprise', joined: '3 days ago', owner: 'David M.', status: 'pending' as const },
];

const ADMIN_TASKS = [
  { label: 'Review KYC documents', count: 6, href: '/administrator/kyc', priority: 'high' as const },
  { label: 'Approve payouts', count: 3, href: '/administrator/payouts', priority: 'high' as const },
  { label: 'Resolve escalations', count: 2, href: '/administrator/tickets', priority: 'medium' as const },
  { label: 'Database maintenance', count: 1, href: '/administrator/system', priority: 'low' as const },
];

function StatCard({ stat }: { stat: Stat }) {
  const isPositive = stat.status === 'up';
  const isNegative = stat.status === 'down';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {stat.label}
        </p>
        <div style={{ opacity: 0.6, color: 'var(--text-secondary)' }}>
          {stat.icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {stat.value}
          </p>
          <p style={{
            fontSize: 12,
            fontWeight: 500,
            marginTop: 4,
            color: isPositive ? 'var(--status-success)' : isNegative ? 'var(--status-danger)' : 'var(--text-muted)',
          }}>
            {isPositive ? '↑' : isNegative ? '↓' : '→'} {stat.delta}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdministratorDashboardPage() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Administrator Dashboard</h1>
        <p>System overview, platform health, and business metrics.</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {STATS.map(stat => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Platform Health & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Platform Health */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Platform Health</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated now</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLATFORM_HEALTH.map((health, idx) => {
                const statusColor = health.status === 'good' ? 'var(--status-success)' : 'var(--status-warning)';
                const statusBg = health.status === 'good' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)';

                return (
                  <div key={idx} style={{
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
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: statusColor }}>
                        {health.value}
                      </p>
                      <div style={{
                        marginTop: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: statusColor,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Action Items */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Admin Action Items</span>
              <span style={{ fontSize: 12, color: 'var(--status-danger)', fontWeight: 500 }}>{ADMIN_TASKS.filter(t => t.priority === 'high').length} high priority</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ADMIN_TASKS.map((task, idx) => (
                <Link key={idx} href={task.href} style={{ textDecoration: 'none' }}>
                  <div style={{
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
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'var(--bg-muted)';
                      el.style.borderColor = 'var(--border-default)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'var(--bg-subtle)';
                      el.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : task.priority === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: task.priority === 'high' ? 'var(--status-danger)' : task.priority === 'medium' ? 'var(--status-warning)' : 'var(--text-muted)',
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        {task.count}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{task.label}</span>
                    </div>
                    <span style={{
                      fontSize: 10,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : task.priority === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: task.priority === 'high' ? 'var(--status-danger)' : task.priority === 'medium' ? 'var(--status-warning)' : 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {task.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Links */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Quick Actions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Payments', href: '/administrator/payments', icon: '💳' },
                { label: 'Tickets', href: '/administrator/tickets', icon: '🎫' },
                { label: 'Calendar', href: '/administrator/calendar', icon: '📅' },
                { label: 'Users', href: '/rentals/tenants', icon: '👥' },
              ].map((link, idx) => (
                <Link key={idx} href={link.href} style={{ textDecoration: 'none' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: 10,
                      fontSize: 13,
                    }}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* New Signups Summary */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Recent Signups</span>
              <span style={{ fontSize: 12, color: 'var(--status-success)', fontWeight: 500 }}>+{RECENT_SIGNUPS.length} this week</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECENT_SIGNUPS.slice(0, 3).map((signup, idx) => (
                <div key={idx} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${signup.status === 'active' ? 'var(--status-success)' : 'var(--status-warning)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{signup.name}</p>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 3,
                      background: signup.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: signup.status === 'active' ? 'var(--status-success)' : 'var(--status-warning)',
                      fontWeight: 500,
                    }}>
                      {signup.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{signup.plan} • {signup.joined}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Owner: {signup.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: stat.status === 'up' ? 'var(--status-success)' : stat.status === 'down' ? 'var(--status-danger)' : 'var(--text-muted)',
                }}
              >
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent signups</span>
            <button className="btn btn-ghost btn-sm">View all</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_SIGNUPS.map(row => (
                  <tr key={row.name}>
                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.owner}</td>
                    <td>
                      <span className="badge badge-info">{row.plan}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="section-header">
              <span className="section-title">Platform health</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLATFORM_HEALTH.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className={`badge badge-${item.status === 'good' ? 'success' : 'warning'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">Admin tasks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ADMIN_TASKS.map(task => (
                <Link
                  key={task.label}
                  href={task.href}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>{task.label}</span>
                  <span className="badge badge-warning">{task.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
