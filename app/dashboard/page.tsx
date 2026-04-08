'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/* --- Types ----------------------------------------------- */
interface StatCard {
  label: string;
  value: string;
  delta-: string;
  deltaDir-: 'up' | 'down' | 'neutral';
  sub-: string;
  color-: string;
}

/* --- Data ------------------------------------------------- */
const RENTAL_STATS: StatCard[] = [
  { label: 'Occupied units',   value: '21 / 24', delta: '+1',  deltaDir: 'up',   sub: '87.5% occupancy', color: 'var(--rental-color)' },
  { label: 'Rent collected',   value: 'KES 378k', delta: '+4%', deltaDir: 'up',  sub: 'This month',      color: 'var(--rental-color)' },
  { label: 'Pending payments', value: '3',        delta: '-2', deltaDir: 'up',   sub: 'Down from 5',     color: 'var(--status-warning)' },
  { label: 'Open maintenance', value: '5',        delta: '+1', deltaDir: 'down', sub: 'Needs attention',  color: 'var(--status-danger)' },
];

const INVENTORY_STATS: StatCard[] = [
  { label: 'Total products',  value: '142',     delta: '+8',  deltaDir: 'up',   sub: 'Across 2 warehouses', color: 'var(--inventory-color)' },
  { label: 'Stock movements', value: '34',      delta: '+12', deltaDir: 'up',   sub: 'This week',           color: 'var(--inventory-color)' },
  { label: 'Low stock items', value: '7',       delta: '+2',  deltaDir: 'down', sub: 'Reorder needed',      color: 'var(--status-warning)' },
  { label: 'Inventory value', value: 'KES 2.4M', delta: '',   deltaDir: 'neutral', sub: 'Estimated',        color: 'var(--inventory-color)' },
];

const SPACES_STATS: StatCard[] = [
  { label: 'Active spaces',  value: '2',       delta: '',    deltaDir: 'neutral', sub: 'Studio + Hall',    color: 'var(--spaces-color)' },
  { label: 'Bookings (MTD)', value: '18',      delta: '+6',  deltaDir: 'up',      sub: 'Month to date',    color: 'var(--spaces-color)' },
  { label: 'Earnings (MTD)', value: 'KES 42k', delta: '+18%', deltaDir: 'up',    sub: 'vs last month',    color: 'var(--spaces-color)' },
  { label: 'Next booking',   value: 'Sat 9am', delta: '',    deltaDir: 'neutral', sub: '2-day notice',     color: 'var(--spaces-color)' },
];

const RENT_PAYMENTS = [
  { unit: 'A3', tenant: 'Mary Kamau',   amount: 'KES 18,000', date: 'Apr 5',  status: 'paid' },
  { unit: 'B1', tenant: 'Peter Otieno', amount: 'KES 22,000', date: 'Apr 4',  status: 'paid' },
  { unit: 'C2', tenant: 'Grace Wanjiku', amount: 'KES 15,000', date: 'Apr 7', status: 'pending' },
  { unit: 'A7', tenant: 'David Njoroge', amount: 'KES 20,000', date: 'Apr 2', status: 'late' },
  { unit: 'D4', tenant: 'Fatuma Said',  amount: 'KES 12,000', date: 'Apr 1',  status: 'paid' },
];

const LOW_STOCK = [
  { name: 'Cement bags (50kg)', sku: 'CEM-001', qty: 12, reorder: 20, warehouse: 'Eastlands' },
  { name: 'Iron sheets 3m',     sku: 'IRN-004', qty: 8,  reorder: 15, warehouse: 'Eastlands' },
  { name: 'PVC pipes 4"',       sku: 'PVC-007', qty: 5,  reorder: 10, warehouse: 'Mombasa Rd' },
  { name: 'Paint (20L white)',   sku: 'PNT-012', qty: 3,  reorder: 8,  warehouse: 'Mombasa Rd' },
];

const UPCOMING_BOOKINGS = [
  { space: 'Studio A', guest: 'Kelvin Mutua',  date: 'Apr 12', time: '9amâ€“1pm',  amount: 'KES 4,000', status: 'confirmed' },
  { space: 'Event Hall', guest: 'Sarah Nyambura', date: 'Apr 14', time: '2pmâ€“8pm', amount: 'KES 18,000', status: 'confirmed' },
  { space: 'Studio A', guest: 'Mike Oloo',     date: 'Apr 15', time: '10amâ€“2pm', amount: 'KES 4,000', status: 'pending' },
];

type Tab = 'rental' | 'inventory' | 'spaces';

const TAB_META: Record<Tab, { label: string; color: string; stats: StatCard[] }> = {
  rental:    { label: 'Rental',    color: 'var(--rental-color)',    stats: RENTAL_STATS },
  inventory: { label: 'Inventory', color: 'var(--inventory-color)', stats: INVENTORY_STATS },
  spaces:    { label: 'Spaces',    color: 'var(--spaces-color)',    stats: SPACES_STATS },
};

/* --- Mini bar chart --------------------------------------- */
function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            minHeight: 3,
            borderRadius: '2px 2px 0 0',
            background: i === data.length - 1 - color : `${color}55`,
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

/* --- Stat Card -------------------------------------------- */
function StatCardItem({ stat, miniData }: { stat: StatCard; miniData-: number[] }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {stat.label}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: stat.color || 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
            {stat.value}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {stat.delta && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: stat.deltaDir === 'up' - 'var(--status-success)' : stat.deltaDir === 'down' - 'var(--status-danger)' : 'var(--text-muted)',
                }}
              >
                {stat.deltaDir === 'up' - '-' : stat.deltaDir === 'down' - '-' : ''} {stat.delta}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.sub}</span>
          </div>
        </div>
        {miniData && (
          <div style={{ width: 64 }}>
            <MiniBar data={miniData} color={stat.color || 'var(--brand-accent)'} />
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Dashboard -------------------------------------------- */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('rental');

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview across all your services</p>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: 'var(--bg-subtle)',
          padding: 4,
          borderRadius: 'var(--radius-lg)',
          width: 'fit-content',
          marginBottom: 24,
        }}
      >
        {(Object.keys(TAB_META) as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: activeTab === tab - 600 : 400,
              color: activeTab === tab - TAB_META[tab].color : 'var(--text-secondary)',
              background: activeTab === tab - 'var(--bg-surface)' : 'transparent',
              boxShadow: activeTab === tab - 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {TAB_META[tab].label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {TAB_META[activeTab].stats.map((stat, i) => (
          <StatCardItem
            key={stat.label}
            stat={stat}
            miniData={[40, 55, 48, 62, 58, 70, 75].slice(i)}
          />
        ))}
      </div>

      {/* Content per tab */}
      {activeTab === 'rental' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Rent payments */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Recent payments</span>
              <Link href="/rentals/payments" style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost btn-sm">View all</button>
              </Link>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Tenant</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RENT_PAYMENTS.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p.unit}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.tenant}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.amount}</td>
                      <td>
                        <span className={`badge badge-${p.status === 'paid' - 'success' : p.status === 'pending' - 'warning' : 'danger'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Occupancy visual */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Unit occupancy</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Occupied</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>21 / 24</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: '87.5%',
                    borderRadius: 999,
                    background: 'var(--rental-color)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
            {[
              { property: 'Sunrise Apartments', occupied: 8, total: 10 },
              { property: 'Mwangi House',       occupied: 9, total: 10 },
              { property: 'Kilimani Bedsitters', occupied: 4, total: 4 },
            ].map(prop => (
              <div key={prop.property} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{prop.property}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{prop.occupied}/{prop.total}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(prop.occupied / prop.total) * 100}%`,
                      borderRadius: 999,
                      background: prop.occupied === prop.total - 'var(--brand-accent)' : 'var(--rental-color)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Low stock */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Low stock alerts</span>
              <Link href="/inventory" style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost btn-sm">View all</button>
              </Link>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Reorder</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {LOW_STOCK.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sku}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--status-danger)' }}>{item.qty}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.reorder}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.warehouse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warehouse summary */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Warehouse summary</span>
            </div>
            {[
              { name: 'Eastlands Warehouse', products: 98,  value: 'KES 1.6M', fill: 72 },
              { name: 'Mombasa Rd Store',    products: 44,  value: 'KES 0.8M', fill: 45 },
            ].map(w => (
              <div
                key={w.name}
                className="card"
                style={{ background: 'var(--bg-subtle)', marginBottom: 12, border: 'none', padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-display)' }}>{w.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.products} products</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--inventory-color)' }}>
                    {w.value}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${w.fill}%`,
                      borderRadius: 999,
                      background: 'var(--inventory-color)',
                    }}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{w.fill}% capacity used</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'spaces' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Upcoming bookings */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Upcoming bookings</span>
              <Link href="/bookings" style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost btn-sm">View all</button>
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {UPCOMING_BOOKINGS.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--spaces-bg)',
                      border: '1px solid var(--spaces-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    -
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{b.space}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.guest} Â· {b.date}, {b.time}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--spaces-color)' }}>{b.amount}</p>
                    <span className={`badge badge-${b.status === 'confirmed' - 'success' : 'warning'}`} style={{ fontSize: 10 }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings chart */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Monthly earnings</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--spaces-color)', marginBottom: 4 }}>
              KES 42,000
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>- 18% vs last month</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {[22, 18, 35, 28, 42, 38, 42].map((v, i) => {
                const max = 42;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${(v / max) * 68}px`,
                        minHeight: 4,
                        borderRadius: '3px 3px 0 0',
                        background: i === 6 - 'var(--spaces-color)' : 'var(--spaces-bg)',
                        border: `1px solid var(--spaces-border)`,
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {['O', 'N', 'D', 'J', 'F', 'M', 'A'][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
