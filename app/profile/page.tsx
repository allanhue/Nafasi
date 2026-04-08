'use client';

import React, { useState } from 'react';

type ServiceContext = 'rental' | 'inventory' | 'spaces';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  contexts: ServiceContext[];
  plan: string;
  memberSince: string;
}

const INITIAL_PROFILE: ProfileData = {
  name: 'James Mwangi',
  email: 'james@karibu.co.ke',
  phone: '+254 712 345 678',
  avatar: 'JM',
  contexts: ['rental', 'inventory', 'spaces'],
  plan: 'Pro',
  memberSince: 'January 2024',
};

const CONTEXT_META: Record<ServiceContext, {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}> = {
  rental: {
    label: 'Rental Management',
    description: 'Manage properties, units, tenants, rent collection and maintenance.',
    color: 'var(--rental-color)',
    bg: 'var(--rental-bg)',
    border: 'var(--rental-border)',
    icon: '¦',
  },
  inventory: {
    label: 'Inventory Tracking',
    description: 'Track stock across warehouses, record movements, manage assets.',
    color: 'var(--inventory-color)',
    bg: 'var(--inventory-bg)',
    border: 'var(--inventory-border)',
    icon: '?',
  },
  spaces: {
    label: 'Space Booking',
    description: 'List spaces for hourly or daily bookings, manage reservations.',
    color: 'var(--spaces-color)',
    bg: 'var(--spaces-bg)',
    border: 'var(--spaces-border)',
    icon: '?',
  },
};

const NOTIFICATION_SETTINGS = [
  { key: 'rent_due',           label: 'Rent due reminders',      description: 'Notified when rent is due in 3 days', defaultOn: true },
  { key: 'payment_received',   label: 'Payment received',         description: 'Alert when a tenant pays rent', defaultOn: true },
  { key: 'maintenance_update', label: 'Maintenance updates',      description: 'Status changes on maintenance requests', defaultOn: true },
  { key: 'low_stock',          label: 'Low stock alerts',         description: 'When stock drops below reorder level', defaultOn: true },
  { key: 'booking_confirmed',  label: 'Booking confirmations',    description: 'New bookings and confirmations', defaultOn: true },
  { key: 'weekly_summary',     label: 'Weekly summary',           description: 'Summary of activity across services', defaultOn: false },
];

type Section = 'profile' | 'contexts' | 'notifications' | 'billing';

export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [notifications, setNotifications] = useState(
    Object.fromEntries(NOTIFICATION_SETTINGS.map(n => [n.key, n.defaultOn]))
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const toggleContext = (ctx: ServiceContext) => {
    setProfile(p => ({
      ...p,
      contexts: p.contexts.includes(ctx)
        ? p.contexts.filter(c => c !== ctx)
        : [...p.contexts, ctx],
    }));
  };

  const toggleNotification = (key: string) => {
    setNotifications(n => ({ ...n, [key]: !n[key] }));
  };

  const SECTIONS: { key: Section; label: string; icon: string }[] = [
    { key: 'profile',       label: 'Profile',       icon: '?' },
    { key: 'contexts',      label: 'My services',   icon: '?' },
    { key: 'notifications', label: 'Notifications', icon: '?' },
    { key: 'billing',       label: 'Billing',       icon: '?' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Account settings</h1>
        <p>Manage your profile, services and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar nav */}
        <div className="card" style={{ padding: '10px', height: 'fit-content', position: 'sticky', top: 80 }}>
          {/* User summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 8px 14px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: 6,
            }}
          >
            <div
              className="avatar"
              style={{ width: 44, height: 44, fontSize: 16 }}
            >
              {profile.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.name}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '1px 7px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 600,
                  background: 'var(--brand-accent-muted)',
                  color: 'var(--brand-primary)',
                  border: '1px solid rgba(46, 204, 143, 0.2)',
                }}
              >
                {profile.plan}
              </span>
            </div>
          </div>

          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeSection === s.key ? 'var(--brand-accent-muted)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: activeSection === s.key ? 500 : 400,
                color: activeSection === s.key ? 'var(--brand-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                transition: 'all 0.12s',
                borderLeft: activeSection === s.key ? '2px solid var(--brand-accent)' : '2px solid transparent',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div>
          {/* Profile section */}
          {activeSection === 'profile' && (
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 22 }}>
                Profile information
              </h2>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div
                  className="avatar"
                  style={{ width: 64, height: 64, fontSize: 22, borderRadius: 'var(--radius-lg)' }}
                >
                  {profile.avatar}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Profile initials</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Member since {profile.memberSince}
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Full name
                  </label>
                  <input
                    className="input"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Phone
                  </label>
                  <input
                    className="input"
                    value={profile.phone}
                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="divider" />

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                Security
              </h3>
              <button className="btn btn-ghost">Change password</button>

              <div className="divider" />

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? '? Saved' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* Contexts / services section */}
          {activeSection === 'contexts' && (
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                My services
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Enable the services you use. Your sidebar and dashboard will adapt automatically.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(Object.keys(CONTEXT_META) as ServiceContext[]).map(ctx => {
                  const meta = CONTEXT_META[ctx];
                  const isActive = profile.contexts.includes(ctx);
                  return (
                    <div
                      key={ctx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-lg)',
                        border: `1px solid ${isActive ? meta.border : 'var(--border-subtle)'}`,
                        background: isActive ? meta.bg : 'var(--bg-subtle)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 'var(--radius-md)',
                          background: isActive ? meta.bg : 'var(--bg-muted)',
                          border: `1px solid ${isActive ? meta.border : 'var(--border-default)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: 15,
                              fontWeight: 700,
                              color: isActive ? meta.color : 'var(--text-secondary)',
                            }}
                          >
                            {meta.label}
                          </span>
                          {isActive && (
                            <span
                              style={{
                                padding: '1px 8px',
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 500,
                                background: 'var(--status-success-bg)',
                                color: 'var(--status-success)',
                              }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{meta.description}</p>
                      </div>
                      <button
                        onClick={() => toggleContext(ctx)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isActive ? meta.border : 'var(--border-default)'}`,
                          background: isActive ? meta.bg : 'transparent',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: 13,
                          fontWeight: 500,
                          color: isActive ? meta.color : 'var(--text-secondary)',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                      >
                        {isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-accent-muted)',
                  border: '1px solid rgba(46, 204, 143, 0.2)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                ?? <strong style={{ color: 'var(--brand-primary)' }}>Tip:</strong> A unit under Rental can also be listed as a Space for short-stay bookings — enable both services to unlock that feature.
              </div>
            </div>
          )}

          {/* Notifications section */}
          {activeSection === 'notifications' && (
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                Notifications
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Choose what you get notified about across your services.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NOTIFICATION_SETTINGS.map((setting, i) => (
                  <div
                    key={setting.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 4px',
                      borderBottom: i < NOTIFICATION_SETTINGS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{setting.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{setting.description}</p>
                    </div>
                    {/* Toggle */}
                    <div
                      onClick={() => toggleNotification(setting.key)}
                      style={{
                        position: 'relative',
                        width: 42,
                        height: 24,
                        borderRadius: 999,
                        background: notifications[setting.key] ? 'var(--brand-primary)' : 'var(--bg-muted)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: notifications[setting.key] ? 21 : 3,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <button className="btn btn-primary" onClick={handleSave}>
                {saved ? '? Saved' : 'Save preferences'}
              </button>
            </div>
          )}

          {/* Billing section */}
          {activeSection === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Current plan */}
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
                  Current plan
                </h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--brand-accent-muted)',
                    border: '1px solid rgba(46, 204, 143, 0.25)',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--brand-primary)' }}>
                      Pro Plan
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      All 3 services · Monthly billing
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--brand-primary)' }}>
                      KES 2,500
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>per month</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Next billing date: <strong>May 1, 2025</strong>
                </p>
              </div>

              {/* Plans comparison */}
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                  Plans
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {[
                    { name: 'Starter', price: 'KES 800', features: ['1 service', '5 units/products', 'Email support'], current: false },
                    { name: 'Pro',     price: 'KES 2,500', features: ['All 3 services', 'Unlimited', 'Priority support'], current: true },
                    { name: 'Enterprise', price: 'Custom', features: ['Custom limits', 'Dedicated support', 'API access'], current: false },
                  ].map(plan => (
                    <div
                      key={plan.name}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: plan.current
                          ? '2px solid var(--brand-accent)'
                          : '1px solid var(--border-subtle)',
                        background: plan.current ? 'var(--brand-accent-muted)' : 'var(--bg-subtle)',
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4, color: plan.current ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {plan.name}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: plan.current ? 'var(--brand-primary)' : 'var(--text-primary)', marginBottom: 12 }}>
                        {plan.price}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                        {plan.features.map(f => (
                          <p key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                            <span style={{ color: 'var(--brand-accent)', fontWeight: 700 }}>?</span>
                            {f}
                          </p>
                        ))}
                      </div>
                      <button
                        className={plan.current ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Current plan' : 'Switch'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
