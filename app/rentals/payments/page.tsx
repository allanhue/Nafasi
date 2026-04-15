'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdAttachMoney } from 'react-icons/md';

type Payment = {
  id: string;
  tenant_id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [form, setForm] = useState({ tenant_id: '', amount: '', due_date: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/payments`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_BASE_URL}/api/rentals/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: form.tenant_id,
          amount: parseFloat(form.amount),
          due_date: form.due_date,
        }),
      });

      if (!res.ok) throw new Error('Failed to create payment');
      
      setForm({ tenant_id: '', amount: '', due_date: '' });
      setSuccess('Payment recorded successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchPayments();
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
      const res = await fetch(`${API_BASE_URL}/api/rentals/payments?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete payment');
      
      setSuccess('Payment deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchPayments();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#86efac';
      case 'pending':
        return '#fcd34d';
      default:
        return '#d1d5db';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

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
            <h2 className="text-lg font-semibold">Record Payment</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Tenant ID *</label>
                <input
                  type="text"
                  placeholder="Tenant ID"
                  value={form.tenant_id}
                  onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
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
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="form-input"
                  required
                  step="0.01"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-success btn-full-width"
              >
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Payment History ({payments.length})</h2>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdAttachMoney />
              </div>
              <div className="empty-state-title">No payments found</div>
              <div className="empty-state-description">Record your first payment using the form</div>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="grid-card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">KES {payment.amount.toLocaleString()}</div>
                      <div className="card-subtitle">Tenant: {payment.tenant_id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`badge ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </div>
                      <KebabMenu
                        items={[
                          {
                            label: 'Delete',
                            icon: <MdDelete />,
                            danger: true,
                            onClick: () => setDeleteConfirm(payment.id),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="card-detail-row">
                    <div><span className="card-detail-label">Due Date:</span> {new Date(payment.due_date).toLocaleDateString()}</div>
                    <div><span className="card-detail-label">Paid Date:</span> {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}</div>
                  </div>

                  {deleteConfirm === payment.id && (
                    <div className="delete-confirm">
                      <p className="delete-confirm-text">
                        Are you sure you want to delete this payment?
                      </p>
                      <div className="button-group">
                        <button
                          onClick={() => handleDelete(payment.id)}
                          disabled={submitting}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={submitting}
                          className="btn btn-secondary"
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
