'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'maintenance' | 'meeting' | 'audit' | 'review';
  attendees: number;
};

const UPCOMING_EVENTS: Event[] = [
  {
    id: '1',
    title: 'System Maintenance Window',
    date: '2026-04-18',
    time: '02:00 - 04:00 UTC',
    location: 'Backend Infrastructure',
    type: 'maintenance',
    attendees: 3,
  },
  {
    id: '2',
    title: 'Quarterly Security Audit',
    date: '2026-04-20',
    time: '10:00 - 12:00 EAT',
    location: 'Conference Room',
    type: 'audit',
    attendees: 5,
  },
  {
    id: '3',
    title: 'Admin Team Sync',
    date: '2026-04-21',
    time: '14:00 - 14:30 EAT',
    location: 'Zoom',
    type: 'meeting',
    attendees: 2,
  },
  {
    id: '4',
    title: 'Database Performance Review',
    date: '2026-04-22',
    time: '09:00 - 10:00 EAT',
    location: 'Tech Lab',
    type: 'review',
    attendees: 4,
  },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 16)); // April 16, 2026

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'maintenance':
        return 'var(--status-danger)';
      case 'audit':
        return 'var(--status-warning)';
      case 'meeting':
        return 'var(--brand-accent)';
      case 'review':
        return 'var(--status-success)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <span className="section-title">Calendar</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handlePrevMonth}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={handleNextMonth}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
        {DAYS.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '8px 0' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((day, idx) => {
          const hasEvent = day && UPCOMING_EVENTS.some(e => {
            const eventDate = parseInt(e.date.split('-')[2]);
            return eventDate === day && currentDate.getMonth() === new Date(e.date).getMonth();
          });

          return (
            <div
              key={idx}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                background: day ? 'var(--bg-subtle)' : 'transparent',
                border: day ? '1px solid var(--border-subtle)' : 'none',
                cursor: day ? 'pointer' : 'default',
                position: 'relative',
                transition: 'all 0.2s',
                fontSize: 13,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (day) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'var(--bg-muted)';
                  el.style.borderColor = 'var(--border-default)';
                }
              }}
              onMouseLeave={(e) => {
                if (day) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'var(--bg-subtle)';
                  el.style.borderColor = 'var(--border-subtle)';
                }
              }}
            >
              {day}
              {hasEvent && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--brand-accent)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminCalendarPage() {
  const typeColors: Record<Event['type'], string> = {
    maintenance: 'var(--status-danger)',
    audit: 'var(--status-warning)',
    meeting: 'var(--brand-accent)',
    review: 'var(--status-success)',
  };

  const typeIcons: Record<Event['type'], string> = {
    maintenance: '🔧',
    audit: '🔍',
    meeting: '👥',
    review: '📋',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Admin Calendar</h1>
        <p>Schedule, track, and manage platform events and maintenance windows.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Calendar */}
        <Calendar />

        {/* Upcoming Events */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Upcoming Events</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{UPCOMING_EVENTS.length} events</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {UPCOMING_EVENTS.map(event => (
              <div
                key={event.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid var(--border-subtle)`,
                  background: 'var(--bg-subtle)',
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: `${typeColors[event.type]}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {typeIcons[event.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                      {event.title}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {event.time}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                        <MapPin size={12} />
                        {event.location}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 9,
                          padding: '3px 8px',
                          borderRadius: 3,
                          background: `${typeColors[event.type]}22`,
                          color: typeColors[event.type],
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {event.type}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {event.attendees} attendees
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
