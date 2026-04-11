'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdAttachMoney } from 'react-icons/md';

type Earning = {
  id: string;
  space_id: string;
  booking_id: string;
  amount: number;
  period: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [form, setForm] = useState({ space_id: '', booking_id: '', amount: '', period: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/earnings`);
      if (!res.ok) throw new Error('Failed to fetch earnings');
      const data = await res.json();
      setEarnings(Array.isArray(data) ? data : []);
      const total = (data || []).reduce((sum: number, e: Earning) => sum + e.amount, 0);
      setTotalEarnings(total);
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
      const res = await fetch(`${API_BASE_URL}/api/bookings/earnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: form.space_id,
          booking_id: form.booking_id,
          amount: parseFloat(form.amount),
          period: form.period,
        }),
      });

      if (!res.ok) throw new Error('Failed to record earning');
      
      setForm({ space_id: '', booking_id: '', amount: '', period: '' });
      setSuccess('Earning recorded successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchEarnings();
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
      const res = await fetch(`${API_BASE_URL}/api/bookings/earnings?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete earning');
      
      setSuccess('Earning deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchEarnings();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  // Group earnings by period
  const groupedByPeriod = earnings.reduce((acc: Record<string, Earning[]>, earning) => {
    if (!acc[earning.period]) {
      acc[earning.period] = [];
    }
    acc[earning.period].push(earning);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Earnings</h1>

      {/* Success message */}
      {success && (
        <div style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #86efac',
        }}>
          ✓ {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #fca5a5',
        }}>
          ✕ {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Earnings</h3>
          <p className="text-4xl font-bold text-green-600">KES {totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Bookings</h3>
          <p className="text-4xl font-bold">{earnings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Average per Booking</h3>
          <p className="text-4xl font-bold">KES {earnings.length > 0 ? Math.round(totalEarnings / earnings.length).toLocaleString() : '0'}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <button
          onClick={() => setExpandedForm(!expandedForm)}
          className="collapsible-header w-full"
          style={{ borderRadius: expandedForm ? '8px 8px 0 0' : '8px' }}
        >
          <h2 className="text-lg font-semibold">Record Earning</h2>
          <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
        </button>

        {expandedForm && (
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
              <label className="form-label">Booking ID *</label>
              <input
                type="text"
                placeholder="Booking ID"
                value={form.booking_id}
                onChange={(e) => setForm({ ...form, booking_id: e.target.value })}
                className="form-input"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="form-label">Amount (KES) *</label>
              <input
                type="number"
                placeholder="Amount"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="form-input"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="form-label">Period *</label>
              <input
                type="text"
                placeholder="e.g., 2024-Q1"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="form-input"
                required
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? '⏳ Recording...' : '✓ Record'}
            </button>
          </form>
        )}
      </div>

      {/* Earnings by period */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Earnings Breakdown</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }} />
            <p>Loading earnings...</p>
          </div>
        ) : Object.keys(groupedByPeriod).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '48px' }}>
              <MdAttachMoney />
            </div>
            <div className="empty-state-title">No earnings recorded</div>
            <div className="empty-state-description">Record your first earning using the form above</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByPeriod).map(([period, periodEarnings]) => {
              const periodTotal = periodEarnings.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={period}>
                  <h3 className="font-semibold mb-3 pb-2 border-b text-lg">{period}</h3>
                  <div className="space-y-2">
                    {periodEarnings.map((earning) => (
                      <div key={earning.id} className="grid-card">
                        <div className="card-header">
                          <div>
                            <div className="card-title">KES {earning.amount.toLocaleString()}</div>
                            <div className="card-subtitle">Booking: {earning.booking_id}</div>
                          </div>
                          <KebabMenu
                            items={[
                              {
                                label: 'Delete',
                                icon: <MdDelete />,
                                danger: true,
                                onClick: () => setDeleteConfirm(earning.id),
                              },
                            ]}
                          />
                        </div>

                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', lineHeight: '1.6' }}>
                          <div><strong>Space:</strong> {earning.space_id}</div>
                          <div><strong>Date:</strong> {new Date(earning.created_at).toLocaleDateString()}</div>
                        </div>

                        {deleteConfirm === earning.id && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: '#fee2e2',
                            borderRadius: '6px',
                            border: '1px solid #fca5a5',
                          }}>
                            <p style={{ color: '#991b1b', marginBottom: '12px', fontSize: '14px' }}>
                              Are you sure you want to delete this earning?
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleDelete(earning.id)}
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
                  <div className="text-right mt-4 pt-4 border-t font-semibold text-lg">
                    Period Total: KES {periodTotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {submitting && <LoadingOverlay />}
    </div>
  );
}
