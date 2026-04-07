'use client';

import React, { useState } from 'react';

/* ─── Types ─────────────────────────────────────────────── */
type UnitStatus = 'occupied' | 'vacant' | 'maintenance';
type PaymentStatus = 'paid' | 'pending' | 'late';
type ListingMode = 'lease' | 'booking' | 'both';

interface Unit {
  id: string;
  number: string;
  property: string;
  tenant: string | null;
  rent: number;
  status: UnitStatus;
  listingMode: ListingMode;
  lastPayment: string | null;
  paymentStatus: PaymentStatus | null;
}

/* ─── Mock data ──────────────────────────────────────────── */
const UNITS: Unit[] = [
  { id: 'u1', number: 'A1', property: 'Sunrise Apartments', tenant: 'Mary Kamau',      rent: 18000, status: 'occupied',    listingMode: 'lease',   lastPayment: 'Apr 5',  paymentStatus: 'paid' },
  { id: 'u2', number: 'A2', property: 'Sunrise Apartments', tenant: 'Peter Otieno',    rent: 18000, status: 'occupied',    listingMode: 'lease',   lastPayment: 'Apr 4',  paymentStatus: 'paid' },
  { id: 'u3', number: 'A3', property: 'Sunrise Apartments', tenant: null,              rent: 18000, status: 'vacant',      listingMode: 'lease',   lastPayment: null,     paymentStatus: null },
  { id: 'u4', number: 'B1', property: 'Mwangi House',       tenant: 'Grace Wanjiku',   rent: 22000, status: 'occupied',    listingMode: 'both',    lastPayment: 'Apr 7',  paymentStatus: 'pending' },
  { id: 'u5', number: 'B2', property: 'Mwangi House',       tenant: 'David Njoroge',   rent: 22000, status: 'occupied',    listingMode: 'lease',   lastPayment: 'Apr 2',  paymentStatus: 'late' },
  { id: 'u6', number: 'B3', property: 'Mwangi House',       tenant: null,              rent: 22000, status: 'maintenance', listingMode: 'lease',   lastPayment: null,     paymentStatus: null },
  { id: 'u7', number: 'C1', property: 'Kilimani Bedsitters', tenant: 'Fatuma Said',    rent: 12000, status: 'occupied',    listingMode: 'booking', lastPayment: 'Apr 1',  paymentStatus: 'paid' },
  { id: 'u8', number: 'C2', property: 'Kilimani Bedsitters', tenant: 'John Mwenda',    rent: 12000, status: 'occupied',    listingMode: 'lease',   lastPayment: 'Mar 30', paymentStatus: 'late' },
];

const MAINTENANCE_REQUESTS = [
  { unit: 'B3', property: 'Mwangi House',       issue: 'Broken window pane',      status: 'in_progress', raised: 'Apr 2',  priority: 'medium' },
  { unit: 'A1', property: 'Sunrise Apartments', issue: 'Leaking tap in kitchen',  status: 'open',        raised: 'Apr 5',  priority: 'low' },
  { unit: 'B2', property: 'Mwangi House',       issue: 'Electrical fault — socket', status: 'open',      raised: 'Apr 6',  priority: 'high' },
  { unit: 'C2', property: 'Kilimani Bedsitters', issue: 'Door lock replacement',   status: 'resolved',   raised: 'Mar 28', priority: 'low' },
  { unit: 'A2', property: 'Sunrise Apartments', issue: 'Blocked drainage',        status: 'open',        raised: 'Apr 4',  priority: 'medium' },
];

type Tab = 'units' | 'maintenance' | 'payments';

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('units');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const [showAddUnit, setShowAddUnit] = useState(false);

  const filteredUnits = UNITS.filter(u => {
    const matchSearch =
      u.number.toLowerCase().includes(search.toLowerCase()) ||
      u.property.toLowerCase().includes(search.toLowerCase()) ||
      (u.tenant ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>Rentals</h1>
            <p>Manage properties, units, tenants and payments</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddUnit(true)}>
            + Add unit
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { label: '21 occupied',    color: 'var(--rental-color)',    bg: 'var(--rental-bg)' },
          { label: '2 vacant',       color: 'var(--status-warning)',  bg: 'var(--status-warning-bg)' },
          { label: '1 maintenance',  color: 'var(--status-danger)',   bg: 'var(--status-danger-bg)' },
          { label: '3 late payments', color: 'var(--status-danger)',  bg: 'var(--status-danger-bg)' },
        ].map(p => (
          <span
            key={p.label}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              background: p.bg,
              color: p.color,
              fontFamily: 'var(--font-body)',
            }}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 20,
          gap: 0,
        }}
      >
        {(['units', 'maintenance', 'payments'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 20px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--rental-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--rental-color)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Units tab */}
      {activeTab === 'units' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search units, tenants…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <select
              className="input select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as UnitStatus | 'all')}
              style={{ maxWidth: 160 }}
            >
              <option value="all">All statuses</option>
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Rent</th>
                  <th>Mode</th>
                  <th>Last payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(unit => (
                  <tr key={unit.id}>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{unit.number}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{unit.property}</td>
                    <td>
                      {unit.tenant ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {unit.tenant.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ fontSize: 13 }}>{unit.tenant}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Vacant</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      KES {unit.rent.toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 500,
                          background: unit.listingMode === 'both' ? 'var(--spaces-bg)' : unit.listingMode === 'booking' ? 'var(--spaces-bg)' : 'var(--rental-bg)',
                          color: unit.listingMode === 'lease' ? 'var(--rental-color)' : 'var(--spaces-color)',
                          border: `1px solid ${unit.listingMode === 'lease' ? 'var(--rental-border)' : 'var(--spaces-border)'}`,
                        }}
                      >
                        {unit.listingMode === 'both' ? 'Lease + Book' : unit.listingMode}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {unit.lastPayment ?? '—'}
                    </td>
                    <td>
                      {unit.status === 'occupied' && unit.paymentStatus ? (
                        <span className={`badge badge-${unit.paymentStatus === 'paid' ? 'success' : unit.paymentStatus === 'pending' ? 'warning' : 'danger'}`}>
                          {unit.paymentStatus}
                        </span>
                      ) : unit.status === 'maintenance' ? (
                        <span className="badge badge-warning">maintenance</span>
                      ) : (
                        <span className="badge badge-muted">vacant</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUnits.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">⌂</div>
              <h3>No units found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}

      {/* Maintenance tab */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MAINTENANCE_REQUESTS.map((req, i) => (
            <div
              key={i}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderLeft: `3px solid ${
                  req.priority === 'high' ? 'var(--status-danger)' :
                  req.priority === 'medium' ? 'var(--status-warning)' :
                  'var(--border-default)'
                }`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{req.issue}</span>
                  <span
                    className={`badge badge-${req.priority === 'high' ? 'danger' : req.priority === 'medium' ? 'warning' : 'muted'}`}
                    style={{ fontSize: 10 }}
                  >
                    {req.priority}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Unit {req.unit} · {req.property} · Raised {req.raised}
                </p>
              </div>
              <span className={`badge badge-${req.status === 'resolved' ? 'success' : req.status === 'in_progress' ? 'info' : 'warning'}`}>
                {req.status.replace('_', ' ')}
              </span>
              <button className="btn btn-ghost btn-sm">Update</button>
            </div>
          ))}
        </div>
      )}

      {/* Payments tab */}
      {activeTab === 'payments' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Collected this month', value: 'KES 378,000', color: 'var(--status-success)' },
              { label: 'Pending',               value: 'KES 40,000',  color: 'var(--status-warning)' },
              { label: 'Overdue',               value: 'KES 34,000',  color: 'var(--status-danger)' },
            ].map(s => (
              <div
                key={s.label}
                className="card"
                style={{ flex: 1, textAlign: 'center', padding: '16px' }}
              >
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { unit: 'A1', tenant: 'Mary Kamau',     amount: 'KES 18,000', date: 'Apr 5',  method: 'M-Pesa',  status: 'paid' },
                  { unit: 'A2', tenant: 'Peter Otieno',   amount: 'KES 18,000', date: 'Apr 4',  method: 'Bank',    status: 'paid' },
                  { unit: 'B1', tenant: 'Grace Wanjiku',  amount: 'KES 22,000', date: '—',      method: '—',       status: 'pending' },
                  { unit: 'B2', tenant: 'David Njoroge',  amount: 'KES 22,000', date: '—',      method: '—',       status: 'late' },
                  { unit: 'C1', tenant: 'Fatuma Said',    amount: 'KES 12,000', date: 'Apr 1',  method: 'M-Pesa',  status: 'paid' },
                  { unit: 'C2', tenant: 'John Mwenda',    amount: 'KES 12,000', date: '—',      method: '—',       status: 'late' },
                ].map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.unit}</td>
                    <td style={{ fontSize: 13 }}>{p.tenant}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.amount}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.date}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.method}</td>
                    <td>
                      <span className={`badge badge-${p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status !== 'paid' && <button className="btn btn-primary btn-sm">Record</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Unit modal */}
      {showAddUnit && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setShowAddUnit(false)}
        >
          <div
            className="card animate-in"
            style={{ width: 440, padding: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              Add new unit
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Property
                </label>
                <select className="input select">
                  <option>Sunrise Apartments</option>
                  <option>Mwangi House</option>
                  <option>Kilimani Bedsitters</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Unit number
                  </label>
                  <input className="input" placeholder="e.g. D1" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Monthly rent (KES)
                  </label>
                  <input className="input" placeholder="e.g. 18000" type="number" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Listing mode
                </label>
                <select className="input select">
                  <option value="lease">Lease only</option>
                  <option value="booking">Booking only</option>
                  <option value="both">Both (Lease + Short stay)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Add unit</button>
                <button className="btn btn-ghost" onClick={() => setShowAddUnit(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}