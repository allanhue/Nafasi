'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdLocalShipping } from 'react-icons/md';

type Movement = {
  id: string;
  product_id: string;
  from_warehouse: string;
  to_warehouse: string;
  quantity: number;
  movement_type: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [form, setForm] = useState({ product_id: '', from_warehouse: '', to_warehouse: '', quantity: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements`);
      if (!res.ok) throw new Error('Failed to fetch movements');
      const data = await res.json();
      setMovements(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: form.product_id,
          from_warehouse: form.from_warehouse,
          to_warehouse: form.to_warehouse,
          quantity: parseInt(form.quantity),
        }),
      });

      if (!res.ok) throw new Error('Failed to create movement');
      
      setForm({ product_id: '', from_warehouse: '', to_warehouse: '', quantity: '' });
      setSuccess('Movement recorded successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchMovements();
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
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete movement');
      
      setSuccess('Movement deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchMovements();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Movements</h1>

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
            <h2 className="text-lg font-semibold">Record Movement</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Product ID *</label>
                <input
                  type="text"
                  placeholder="Product ID"
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">From Warehouse</label>
                <input
                  type="text"
                  placeholder="From Warehouse"
                  value={form.from_warehouse}
                  onChange={(e) => setForm({ ...form, from_warehouse: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">To Warehouse</label>
                <input
                  type="text"
                  placeholder="To Warehouse"
                  value={form.to_warehouse}
                  onChange={(e) => setForm({ ...form, to_warehouse: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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
                {submitting ? 'Recording...' : 'Record Movement'}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Movement History ({movements.length})</h2>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading movements...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdLocalShipping />
              </div>
              <div className="empty-state-title">No movements recorded</div>
              <div className="empty-state-description">Record your first movement using the form</div>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="grid-card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{movement.product_id}</div>
                      <div className="card-subtitle">Type: {movement.movement_type}</div>
                    </div>
                    <KebabMenu
                      items={[
                        {
                          label: 'Delete',
                          icon: <MdDelete />,
                          danger: true,
                          onClick: () => setDeleteConfirm(movement.id),
                        },
                      ]}
                    />
                  </div>

                  <div className="card-detail-row">
                    <div><span className="card-detail-label">From:</span> {movement.from_warehouse}</div>
                    <div><span className="card-detail-label">To:</span> {movement.to_warehouse}</div>
                    <div><span className="card-detail-label">Quantity:</span> {movement.quantity} units</div>
                    <div><span className="card-detail-label">Date:</span> {new Date(movement.created_at).toLocaleDateString()}</div>
                  </div>

                  {deleteConfirm === movement.id && (
                    <div className="delete-confirm">
                      <p className="delete-confirm-text">
                        Are you sure you want to delete this movement?
                      </p>
                      <div className="button-group">
                        <button
                          onClick={() => handleDelete(movement.id)}
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
