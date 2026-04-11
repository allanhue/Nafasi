'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdEventAvailable } from 'react-icons/md';

type Booking = {
  id: string;
  space_id: string;
  guest_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total: number;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [form, setForm] = useState({ space_id: '', guest_name: '', start_date: '', end_date: '', total: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/bookings`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: form.space_id,
          guest_name: form.guest_name,
          start_date: form.start_date,
          end_date: form.end_date,
          total: parseFloat(form.total),
        }),
      });

      if (!res.ok) throw new Error('Failed to create booking');
      
      setForm({ space_id: '', guest_name: '', start_date: '', end_date: '', total: '' });
      setSuccess('Booking created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchBookings();
      setExpandedForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/bookings?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete booking');
      
      setSuccess('Booking deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchBookings();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#86efac';
      case 'pending':
        return '#fcd34d';
      case 'cancelled':
        return '#f87171';
      default:
        return '#d1d5db';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      {/* Success message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <button
            onClick={() => setExpandedForm(!expandedForm)}
            className="collapsible-header w-full"
          >
            <h2 className="text-lg font-semibold">New Booking</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Space ID *</label>
                <input
                  type="text"
                  placeholder="Space ID"
                  value={form.space_id}
                  onChange={(e) => setForm({ ...form, space_id: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Guest Name *</label>
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Check-in Date *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Check-out Date *</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Total (KES) *</label>
                <input
                  type="number"
                  placeholder="Total"
                  step="0.01"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-full-width"
              >
                {submitting ? 'Creating...' : 'Create Booking'}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bookings ({bookings.length})</h2>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdEventAvailable />
              </div>
              <div className="empty-state-title">No bookings found</div>
              <div className="empty-state-description">Create your first booking using the form</div>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="grid-card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{booking.guest_name}</div>
                      <div className="card-subtitle">Space: {booking.space_id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                      <KebabMenu
                        items={[
                          {
                            label: 'Delete',
                            icon: <MdDelete />,
                            danger: true,
                            onClick: () => setDeleteConfirm(booking.id),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', lineHeight: '1.6' }}>
                    <div><strong>Check-in:</strong> {new Date(booking.start_date).toLocaleDateString()}</div>
                    <div><strong>Check-out:</strong> {new Date(booking.end_date).toLocaleDateString()}</div>
                    <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                      KES {booking.total.toLocaleString()}
                    </div>
                  </div>

                  {deleteConfirm === booking.id && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#fee2e2',
                      borderRadius: '6px',
                      border: '1px solid #fca5a5',
                    }}>
                      <p style={{ color: '#991b1b', marginBottom: '12px', fontSize: '14px' }}>
                        Are you sure you want to delete this booking?
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          disabled={submitting}
                          className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={submitting}
                          className="flex-1 bg-gray-200 text-gray-800 py-1 rounded text-sm hover:bg-gray-300 disabled:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {submitting && <LoadingOverlay />}
    </div>
  );
}
