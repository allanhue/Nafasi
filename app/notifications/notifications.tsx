'use client';

import { useEffect, useState } from 'react';
import { readSession } from '../lib/session';

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | string;
  read: boolean;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const typeBadge = (type: string) => {
  switch (type) {
    case 'success':
      return 'badge badge-success';
    case 'warning':
      return 'badge badge-warning';
    case 'error':
      return 'badge badge-danger';
    case 'info':
      return 'badge badge-info';
    default:
      return 'badge badge-muted';
  }
};

export default function NotificationsComponent({ compact = false }: { compact?: boolean } = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    const session = readSession();
    if (!session?.token) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const session = readSession();

    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      setNotifications(current => current.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div>
      {!compact ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Notifications</h2>
          <button className="btn btn-ghost btn-sm" type="button" onClick={fetchNotifications} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button className="btn btn-ghost btn-sm" type="button" onClick={fetchNotifications} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}

      {error ? <div className="alert alert-error">{error}</div> : null}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">BT</div>
          <h3>No notifications</h3>
          <p>{loading ? 'Loading…' : 'You are all caught up.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {notifications.map((notif) => {
            const createdAt = notif.created_at ? new Date(notif.created_at).toLocaleString() : '';

            return (
              <div key={notif.id} className="grid-card" style={{ opacity: notif.read ? 0.85 : 1 }}>
                <div className="card-header">
                  <div>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {notif.title}
                      <span className={typeBadge(String(notif.type))}>{String(notif.type || 'info')}</span>
                      {!notif.read ? <span className="badge badge-info">new</span> : null}
                    </div>
                    <div className="card-subtitle">{createdAt}</div>
                  </div>
                  {!notif.read ? (
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => markAsRead(notif.id)}>
                      Mark read
                    </button>
                  ) : null}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.55 }}>
                  {notif.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
