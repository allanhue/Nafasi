'use client';

import Link from 'next/link';

type Stat = {
  label: string;
  value: string;
  delta: string;
  status: 'up' | 'down' | 'neutral';
};

const STATS: Stat[] = [
  { label: 'Active customers', value: '412', delta: '+18', status: 'up' },
  { label: 'Monthly revenue', value: 'KES 4.8M', delta: '+6%', status: 'up' },
  { label: 'Churn risk', value: '12', delta: '-3', status: 'down' },
  { label: 'Open tickets', value: '19', delta: '+2', status: 'neutral' },
];

const PLATFORM_HEALTH = [
  { label: 'API latency', value: '220ms', status: 'good' },
  { label: 'Background jobs', value: '2 running', status: 'good' },
  { label: 'Email queue', value: '7 pending', status: 'warning' },
];

const RECENT_SIGNUPS = [
  { name: 'Nairobi Homes', plan: 'Pro', joined: 'Today', owner: 'Grace W.' },
  { name: 'Juja Stores', plan: 'Starter', joined: 'Yesterday', owner: 'Peter O.' },
  { name: 'Coastline Venues', plan: 'Pro', joined: '2 days ago', owner: 'Farah A.' },
];

const ADMIN_TASKS = [
  { label: 'Review KYC documents', count: 6, href: '/administrator/kyc' },
  { label: 'Approve payouts', count: 3, href: '/administrator/payouts' },
  { label: 'Resolve escalations', count: 2, href: '/administrator/tickets' },
];

export default function AdministratorDashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Administrator overview</h1>
        <p>Monitor platform health, revenue, and customer growth.</p>
      </div>

      <div className="stats-grid">
        {STATS.map(stat => (
          <div key={stat.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </p>
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
