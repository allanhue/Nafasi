import Link from 'next/link';

const SERVICES = [
  {
    key: 'rental',
    icon: 'RM',
    title: 'Rental Management',
    tagline: 'Landlords, units and tenants',
    description:
      'Manage properties, collect rent, track leases, and handle maintenance requests in one place.',
    color: 'var(--rental-color)',
    bg: 'var(--rental-bg)',
    border: 'var(--rental-border)',
    href: '/rentals',
    stats: [
      { label: 'Properties', value: '3' },
      { label: 'Units', value: '24' },
      { label: 'Occupancy', value: '88%' },
    ],
  },
  {
    key: 'inventory',
    icon: 'IT',
    title: 'Inventory Tracking',
    tagline: 'Stock, warehouses and assets',
    description:
      'Track stock levels across locations, record movements, and get low-stock alerts early.',
    color: 'var(--inventory-color)',
    bg: 'var(--inventory-bg)',
    border: 'var(--inventory-border)',
    href: '/inventory',
    stats: [
      { label: 'Products', value: '142' },
      { label: 'Warehouses', value: '2' },
      { label: 'Low stock', value: '7' },
    ],
  },
  {
    key: 'spaces',
    icon: 'SB',
    title: 'Space Booking',
    tagline: 'Studios, halls and venues',
    description:
      'List spaces for hourly or daily bookings, accept payments, and track earnings.',
    color: 'var(--spaces-color)',
    bg: 'var(--spaces-bg)',
    border: 'var(--spaces-border)',
    href: '/bookings',
    stats: [
      { label: 'Spaces', value: '2' },
      { label: 'This month', value: '18' },
      { label: 'Earnings', value: 'KES 42k' },
    ],
  },
];

const QUICK_ACTIONS = [
  { label: 'Record rent payment', icon: 'PY', href: '/rentals/payments/new', context: 'rental' },
  { label: 'Add stock movement', icon: 'MV', href: '/inventory/movements/new', context: 'inventory' },
  { label: 'New booking', icon: 'BK', href: '/bookings/new', context: 'spaces' },
  { label: 'Add property unit', icon: 'AD', href: '/rentals/units/new', context: 'rental' },
];

const RECENT_ACTIVITY = [
  {
    text: 'Rent paid - Unit A3, KES 18,000',
    time: '2 hours ago',
    context: 'rental',
    status: 'success',
  },
  {
    text: 'Low stock alert - Cement bags (12 remaining)',
    time: '4 hours ago',
    context: 'inventory',
    status: 'warning',
  },
  {
    text: 'Studio booked - Sat 12 Apr, 2-6 PM',
    time: 'Yesterday',
    context: 'spaces',
    status: 'info',
  },
  {
    text: 'Maintenance resolved - Unit B7 plumbing',
    time: 'Yesterday',
    context: 'rental',
    status: 'success',
  },
  {
    text: 'Stock received - Iron sheets x200',
    time: '2 days ago',
    context: 'inventory',
    status: 'success',
  },
];

const CONTEXT_META = {
  rental: { label: 'Rental', dot: '#1A6B4A' },
  inventory: { label: 'Inventory', dot: '#A05C1A' },
  spaces: { label: 'Spaces', dot: '#1A4A8A' },
};

export default function HomePage() {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28 }}>Habari, James</h1>
        <p>Here is what is happening across your platform today.</p>
      </div>

      <div className="service-grid">
        {SERVICES.map(service => (
          <Link key={service.key} href={service.href} className="card-link">
            <div className="card service-card" style={{ borderColor: service.border }}>
              <div className="service-header">
                <div
                  className="service-icon"
                  style={{ background: service.bg, borderColor: service.border, color: service.color }}
                >
                  {service.icon}
                </div>
                <div>
                  <h2 style={{ color: service.color }}>{service.title}</h2>
                  <p>{service.tagline}</p>
                </div>
              </div>

              <p className="service-description">{service.description}</p>

              <div className="service-stats">
                {service.stats.map(stat => (
                  <div key={stat.label}>
                    <p className="service-stat-value" style={{ color: service.color }}>
                      {stat.value}
                    </p>
                    <p className="service-stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="lower-grid">
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent activity</span>
            <button className="btn btn-ghost btn-sm">View all</button>
          </div>

          <div>
            {RECENT_ACTIVITY.map((item, index) => {
              const meta = CONTEXT_META[item.context as keyof typeof CONTEXT_META];
              return (
                <div
                  key={`${item.text}-${index}`}
                  className="activity-row"
                  style={{ borderBottom: index < RECENT_ACTIVITY.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <span className="activity-dot" style={{ background: meta.dot }} />

                  <div className="activity-text">
                    <p>{item.text}</p>
                    <div className="activity-meta">
                      <span className={`context-tag context-${item.context}`}>{meta.label}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>

                  <span className={`badge badge-${item.status}`}>
                    {item.status === 'success' ? 'OK' : item.status === 'warning' ? '!' : 'i'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="quick-stack">
          <div className="card">
            <div className="section-header" style={{ marginBottom: 12 }}>
              <span className="section-title">Quick actions</span>
            </div>
            <div className="quick-actions">
              {QUICK_ACTIONS.map(action => {
                const meta = CONTEXT_META[action.context as keyof typeof CONTEXT_META];
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="btn btn-ghost quick-action"
                    role="button"
                  >
                    <span className="quick-dot" style={{ background: meta.dot }} />
                    <span className="quick-icon">{action.icon}</span>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="card highlight-card">
            <p className="highlight-title">Did you know?</p>
            <p className="highlight-body">
              You can list a rental unit as a short-stay space under Bookings without duplicating listings.
            </p>
            <Link href="/rentals" className="btn btn-sm highlight-button" role="button">
              Try it {'>'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
