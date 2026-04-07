'use client';

import React, { useState } from 'react';

/* ─── Types ─────────────────────────────────────────────── */
type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
type SpaceType = 'studio' | 'event_hall' | 'coworking' | 'meeting_room';

interface Space {
  id: string;
  name: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number;
  location: string;
  description: string;
  isPublic: boolean;
  bookingsThisMonth: number;
}

interface Booking {
  id: string;
  space: string;
  guest: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  amount: number;
  status: BookingStatus;
  paymentRef: string;
}

/* ─── Data ───────────────────────────────────────────────── */
const SPACES: Space[] = [
  {
    id: 's1',
    name: 'Studio A',
    type: 'studio',
    capacity: 10,
    pricePerHour: 1000,
    location: 'Westlands, Nairobi',
    description: 'Professional recording and photography studio with natural light and equipment.',
    isPublic: true,
    bookingsThisMonth: 11,
  },
  {
    id: 's2',
    name: 'Karibu Event Hall',
    type: 'event_hall',
    capacity: 120,
    pricePerHour: 3000,
    location: 'Kilimani, Nairobi',
    description: 'Spacious hall for corporate events, workshops, and private functions.',
    isPublic: true,
    bookingsThisMonth: 7,
  },
];

const BOOKINGS: Booking[] = [
  { id: 'b1', space: 'Studio A',         guest: 'Kelvin Mutua',    date: 'Apr 12', startTime: '9:00 AM',  endTime: '1:00 PM',  hours: 4, amount: 4000,  status: 'confirmed',  paymentRef: 'MP240412A' },
  { id: 'b2', space: 'Karibu Event Hall', guest: 'Sarah Nyambura',  date: 'Apr 14', startTime: '2:00 PM',  endTime: '8:00 PM',  hours: 6, amount: 18000, status: 'confirmed',  paymentRef: 'MP240414B' },
  { id: 'b3', space: 'Studio A',         guest: 'Mike Oloo',       date: 'Apr 15', startTime: '10:00 AM', endTime: '2:00 PM',  hours: 4, amount: 4000,  status: 'pending',    paymentRef: '' },
  { id: 'b4', space: 'Studio A',         guest: 'Amina Hassan',    date: 'Apr 9',  startTime: '2:00 PM',  endTime: '5:00 PM',  hours: 3, amount: 3000,  status: 'completed',  paymentRef: 'MP240409C' },
  { id: 'b5', space: 'Karibu Event Hall', guest: 'Tom Kamau',      date: 'Apr 5',  startTime: '10:00 AM', endTime: '4:00 PM',  hours: 6, amount: 18000, status: 'completed',  paymentRef: 'MP240405D' },
  { id: 'b6', space: 'Studio A',         guest: 'Lena Waweru',     date: 'Apr 3',  startTime: '1:00 PM',  endTime: '3:00 PM',  hours: 2, amount: 2000,  status: 'cancelled',  paymentRef: '' },
];

const SPACE_TYPE_META: Record<SpaceType, { label: string; icon: string }> = {
  studio:       { label: 'Studio',       icon: '◉' },
  event_hall:   { label: 'Event hall',   icon: '⬡' },
  coworking:    { label: 'Co-working',   icon: '⊞' },
  meeting_room: { label: 'Meeting room', icon: '⊟' },
};

type Tab = 'spaces' | 'bookings' | 'calendar';

/* ─── Bookings Page ──────────────────────────────────────── */
export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('spaces');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [showNewBooking, setShowNewBooking] = useState(false);

  const filteredBookings = BOOKINGS.filter(b => {
    return statusFilter === 'all' || b.status === statusFilter;
  });

  const totalEarnings = BOOKINGS
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>Spaces & Bookings</h1>
            <p>Manage your spaces, availability and reservations</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost">+ Add space</button>
            <button className="btn btn-primary" onClick={() => setShowNewBooking(true)}>
              + New booking
            </button>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total earnings (MTD)',   value: `KES ${totalEarnings.toLocaleString()}`, color: 'var(--spaces-color)' },
          { label: 'Confirmed bookings',     value: BOOKINGS.filter(b => b.status === 'confirmed').length.toString(),  color: 'var(--status-success)' },
          { label: 'Pending confirmation',   value: BOOKINGS.filter(b => b.status === 'pending').length.toString(),    color: 'var(--status-warning)' },
        ].map(s => (
          <div
            key={s.label}
            className="card"
            style={{ flex: 1, padding: '14px 18px' }}
          >
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        {(['spaces', 'bookings', 'calendar'] as Tab[]).map(tab => (
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
              color: activeTab === tab ? 'var(--spaces-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--spaces-color)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Spaces tab */}
      {activeTab === 'spaces' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {SPACES.map(space => {
            const meta = SPACE_TYPE_META[space.type];
            return (
              <div key={space.id} className="card" style={{ padding: 22 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--spaces-bg)',
                      border: '1px solid var(--spaces-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{space.name}</h3>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: space.isPublic ? 'var(--status-success)' : 'var(--text-muted)',
                        }}
                        title={space.isPublic ? 'Public' : 'Private'}
                      />
                    </div>
                    <span className="badge badge-info" style={{ fontSize: 11 }}>{meta.label}</span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                  {space.description}
                </p>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16, padding: '12px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--spaces-color)' }}>
                      KES {space.pricePerHour.toLocaleString()}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>per hour</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                      {space.capacity}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>max people</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--spaces-color)' }}>
                      {space.bookingsThisMonth}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>bookings MTD</p>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                  📍 {space.location}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Edit space</button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setShowNewBooking(true)}
                  >
                    Book now
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new space card */}
          <div
            className="card"
            style={{
              padding: 22,
              border: '2px dashed var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              minHeight: 240,
              background: 'transparent',
              boxShadow: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)')}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
          >
            <span style={{ fontSize: 28, opacity: 0.3 }}>⊞</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Add a new space
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Studio, event hall, co-working, or meeting room
            </p>
          </div>
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <select
              className="input select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as BookingStatus | 'all')}
              style={{ maxWidth: 180 }}
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredBookings.map(b => (
              <div
                key={b.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 18px',
                  opacity: b.status === 'cancelled' ? 0.6 : 1,
                }}
              >
                {/* Space icon */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--spaces-bg)',
                    border: '1px solid var(--spaces-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                    color: 'var(--spaces-color)',
                  }}
                >
                  {b.space.includes('Hall') ? '⬡' : '◉'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{b.space}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.guest}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {b.date} · {b.startTime} – {b.endTime} ({b.hours}h)
                    {b.paymentRef && <span style={{ marginLeft: 8 }}>Ref: {b.paymentRef}</span>}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--spaces-color)' }}>
                    KES {b.amount.toLocaleString()}
                  </p>
                  <span
                    className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'cancelled' ? 'danger' : 'muted'}`}
                    style={{ fontSize: 10 }}
                  >
                    {b.status}
                  </span>
                </div>

                {b.status === 'pending' && (
                  <button className="btn btn-primary btn-sm">Confirm</button>
                )}
              </div>
            ))}
          </div>

          {filteredBookings.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">⬡</div>
              <h3>No bookings found</h3>
              <p>Try adjusting the status filter</p>
            </div>
          )}
        </>
      )}

      {/* Calendar tab */}
      {activeTab === 'calendar' && (
        <div className="card" style={{ padding: 28 }}>
          {/* Simple weekly calendar */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div
                key={day}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRight: i < 6 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{day}</p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: i === 5 ? 700 : 400,
                    fontSize: 16,
                    color: i === 5 ? 'var(--spaces-color)' : 'var(--text-primary)',
                  }}
                >
                  {7 + i}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'].map((hour, hi) => (
            <div
              key={hour}
              style={{
                display: 'flex',
                borderTop: '1px solid var(--border-subtle)',
                minHeight: 48,
              }}
            >
              <div
                style={{
                  width: 56,
                  padding: '8px 8px 8px 0',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                  textAlign: 'right',
                }}
              >
                {hour}
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map(di => {
                const isBooking = (di === 5 && hi >= 0 && hi <= 3) || (di === 0 && hi >= 3 && hi <= 4);
                const isHall = di === 0 && hi >= 5 && hi <= 7;
                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      padding: '4px 3px',
                      borderLeft: '1px solid var(--border-subtle)',
                      position: 'relative',
                    }}
                  >
                    {isBooking && hi === (di === 5 ? 0 : 3) && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: 3,
                          right: 3,
                          height: di === 5 ? 180 : 92,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--spaces-bg)',
                          border: '1px solid var(--spaces-border)',
                          padding: '4px 6px',
                          fontSize: 10,
                          color: 'var(--spaces-color)',
                          fontWeight: 500,
                          overflow: 'hidden',
                          zIndex: 2,
                        }}
                      >
                        {di === 5 ? 'Studio A · Kelvin' : 'Studio A · Mike'}
                      </div>
                    )}
                    {isHall && hi === 5 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: 3,
                          right: 3,
                          height: 140,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(26, 74, 138, 0.12)',
                          border: '1px solid rgba(26, 74, 138, 0.25)',
                          padding: '4px 6px',
                          fontSize: 10,
                          color: 'var(--spaces-color)',
                          fontWeight: 500,
                          overflow: 'hidden',
                          zIndex: 2,
                        }}
                      >
                        Event Hall · Sarah
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* New booking modal */}
      {showNewBooking && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setShowNewBooking(false)}
        >
          <div
            className="card animate-in"
            style={{ width: 460, padding: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              New booking
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Space</label>
                <select className="input select">
                  {SPACES.map(s => <option key={s.id}>{s.name} — KES {s.pricePerHour.toLocaleString()}/hr</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Guest name</label>
                <input className="input" placeholder="Full name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Date</label>
                  <input className="input" type="date" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Start</label>
                  <input className="input" type="time" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>End</label>
                  <input className="input" type="time" />
                </div>
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--spaces-bg)',
                  border: '1px solid var(--spaces-border)',
                  fontSize: 13,
                  color: 'var(--spaces-color)',
                }}
              >
                <strong>Estimated total:</strong> KES 4,000 (4 hours × KES 1,000)
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Create booking</button>
                <button className="btn btn-ghost" onClick={() => setShowNewBooking(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}